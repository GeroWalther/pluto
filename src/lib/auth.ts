import { compare } from 'bcryptjs';
import type { AuthOptions, Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { AuthProvider, Role } from '@prisma/client';
import prisma from '@/db/db';
import { hasGithubAuth, hasGoogleAuth } from './env';

const providers: AuthOptions['providers'] = [];

if (hasGoogleAuth()) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (hasGithubAuth()) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: 'Email and password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        throw new Error('Please enter your email and password.');
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });

      // Same message for "no such user" and "wrong password" so the form
      // cannot be used to enumerate which emails have accounts.
      const invalid = new Error('That email and password combination is incorrect.');
      if (!user) throw invalid;

      if (!user.passwordHash) {
        throw new Error(
          `This account was created with ${user.provider === AuthProvider.GOOGLE ? 'Google' : 'GitHub'}. Please use that sign-in button.`
        );
      }

      if (!(await compare(credentials.password, user.passwordHash))) throw invalid;

      if (!user.emailVerifiedAt) {
        throw new Error('Please verify your email address first — check your inbox.');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  })
);

export const authOptions: AuthOptions = {
  providers,

  pages: { signIn: '/sign-in', newUser: '/sign-up', error: '/sign-in' },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * OAuth sign-ins create the local user row on first login. Credentials
     * sign-ins already have one by the time we get here.
     */
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') return true;
      if (!user.email) return false;

      const provider =
        account.provider === 'google' ? AuthProvider.GOOGLE : AuthProvider.GITHUB;

      await prisma.user.upsert({
        where: { email: user.email.toLowerCase() },
        // Never overwrite a name/avatar the user has customised locally.
        update: { emailVerifiedAt: new Date() },
        create: {
          email: user.email.toLowerCase(),
          name: user.name ?? user.email.split('@')[0],
          image: user.image,
          provider,
          emailVerifiedAt: new Date(),
        },
      });

      return true;
    },

    async jwt({ token, trigger }) {
      if (!token.email) return token;

      // Re-read on sign-in and on an explicit session.update() so role and
      // seller status stay accurate without a database hit on every request.
      if (!token.id || trigger === 'signIn' || trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            stripeAccountId: true,
            stripePayoutsEnabled: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.role = dbUser.role;
          token.isSeller = Boolean(dbUser.stripeAccountId);
          token.payoutsEnabled = dbUser.stripePayoutsEnabled;
        }
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? Role.USER;
        session.user.isSeller = Boolean(token.isSeller);
        session.user.payoutsEnabled = Boolean(token.payoutsEnabled);
      }
      return session;
    },
  },
};

export function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export const isAdmin = (session: Session | null) => session?.user?.role === Role.ADMIN;
