import prisma from '@/db/db';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { hash } from 'bcryptjs';

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
      //   When someone tries to sign in, the authorize method is called with the credentials they provide.
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('xxxxxx');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('Please enter an existing email');
        }

        if (!user.isEmailVerified) {
          throw new Error('Please verify your email.');
        }

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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.SECRET!,
  callbacks: {
    session: ({ session, token }) => {
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
      // from where do we get account passed in?
      if (account?.provider === 'github') {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email as string,
          },
        });
        if (dbUser) {
          return {
            ...token,
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
          };
        }

        // if (!dbUser) {
        //   const hashedPassword = await hash(user.password, 10);
        //   const newUser = await prisma.user.create({
        //     data: {
        //       name,
        //       email,
        //       provider: 'github',
        //       emailVerified: true,
        //       password: hashedPassword,
        //       subscriptionTier: 'free',
        //       membership: 'active',
        //     },
        //   });

        //   return {
        //     ...token,
        //     id: newUser.id,
        //     name: newUser.name,
        //     email: newUser.email,
        //   };
        // }
      } else if (account?.provider === 'google') {
        const picture = token.picture;

        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email as string,
          },
        });
        if (dbUser) {
          return {
            ...token,
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            picture: picture,
          };
        }
        // if (!dbUser) {
        //   const newUser = await prisma.user.create({
        //     data: {
        //       name,
        //       email,
        //       provider: 'google',
        //       emailVerified: true,
        //       password: await hash(name!, 10),
        //     },
        //   });

        //   return {
        //     ...token,
        //     id: newUser.id,
        //     name: newUser.name,
        //     email: newUser.email,
        //   };
        // }
      }
      if (trigger === 'update') {
        // update token
        console.log(session.user.role);
        return {
          ...token,
          ...session.user,
        };
      }
      // Add additional token info

      const dbUser = await prisma.user.findUnique({
        where: {
          email: token.email as string,
        },
      });

      if (!dbUser) {
        return token;
      }

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
