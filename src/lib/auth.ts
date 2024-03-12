import prisma from '@/db/db';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
  // Providers array will be configured in the next steps
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

  session: {
    strategy: 'jwt',
  },
};
