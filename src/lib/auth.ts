import { compare, hash } from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { createUser, findUserbyEmail } from '../../prisma/prisma.user';

export const authOptions: AuthOptions = {
  // Providers array will be configured in the next steps
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'example@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      // When someone tries to sign in, the authorize method is called with the credentials they provide.
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('xxxxxx');
        }
        const user = await findUserbyEmail(credentials.email);

        if (!user) {
          throw new Error('Please enter an existing email');
        }

        if (user.provider !== 'credentials' && user.provider === 'google') {
          throw new Error('Please sign in in using Google sign in.');
        }

        if (user.provider !== 'credentials' && user.provider === 'github') {
          throw new Error('Please sign in using Github sign in.');
        }

        if (!user.isEmailVerified) {
          throw new Error('Please verify your email.');
        }

        if (!(await compare(credentials.password, user.password))) {
          throw new Error('The password you entered is incorrect');
        }

        // this is our token for the callback function
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.isAdmin,
          image: user.image,
        };
      },
    }),
  ],

  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days expiration
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days expiration
  },

  secret: process.env.SECRET!,

  //runs after authorize function
  callbacks: {
    session: ({ session, token }) => {
      //token is returned from authorize function above or O-Auth providers
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.image as string | null | undefined,
          role: token.role,
        },
      };
    },

    jwt: async ({ token, user, trigger, session, account }) => {
      // we get these from either our authorize function returned or from the github/google O-Auth

      if (account?.provider === 'github') {
        const user = await findUserbyEmail(token.email!);

        // Now the sign Up part for github
        if (!user) {
          const newUser = await createUser({
            name: token?.name,
            email: token.email!,
            isEmailVerified: true,
            password: await hash(token.name!, 10),
            image: token.picture,
            token: await hash(token.email!, 10),
            provider: 'github',
          });

          return {
            ...token,
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: token.picture,
          };
        }

        // Normal sign in
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: token.picture,
        };
      } else if (account?.provider === 'google') {
        const name = token.name;
        const email = token.email;
        const picture = token.picture;
        const user = await findUserbyEmail(email!);
        // Normal sign in
        if (user) {
          return {
            ...token,
            id: user.id,
            name: user.name,
            email: user.email,
            image: picture,
          };
        }
        // Now the sign Up part for github
        if (!user) {
          const newUser = await createUser({
            name,
            email: email!,
            isEmailVerified: true,
            password: await hash(name!, 10),
            image: picture,
            token: await hash(email!, 10),
            provider: 'google',
          });

          return {
            ...token,
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: picture,
          };
        }
      }
      if (trigger === 'update') {
        return {
          ...token,
          ...session.user,
        };
      }

      // Add additional token info
      const dbUser = await findUserbyEmail(token.email as string);

      if (!dbUser) {
        return token;
      }

      // this will be available in the useSession hook under data
      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image!,
        role: dbUser.isAdmin,
      };
    },
  },
};
