import prisma from "@/db/db";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  // Providers array will be configured in the next steps
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      //   When someone tries to sign in, the authorize method is called with the credentials they provide.
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("xxxxxx");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Please enter an existing email");
        }

        if (!user.isEmailVerified) {
          throw new Error("Please verify your email.");
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
    signIn: "/sign-in",
    newUser: "/sign-up",
  },

  session: {
    strategy: "jwt",
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

    jwt: async ({ token, user, trigger }) => {
      if (trigger === "update") {
        // update token
        console.log("update");
      }
      // Add additional token info

      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
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
