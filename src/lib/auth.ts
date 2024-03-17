import prisma from "@/db/db";
import { compare, hash } from "bcryptjs";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

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

        if (!(user.provider === "credentials")) {
          throw new Error("Please sign in with your social account.");
        }

        if (!user.isEmailVerified) {
          throw new Error("Please verify your email.");
        }

        if (!(await compare(credentials.password, user.password))) {
          throw new Error("The password you entered is incorrect");
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

    jwt: async ({ token, user, trigger, session, account }) => {
      // from where do we get account passed in?
      if (account?.provider === "github") {
        const name = token.name;
        const email = token.email;
        const picture = token.picture;
        const user = await prisma.user.findUnique({
          where: {
            email: email!,
          },
        });
        // Now the sign Up part for github
        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              name,
              email: email!,
              isEmailVerified: true,
              password: await hash(name!, 10),
              image: picture,
              token: await hash(email!, 10),
              provider: "github",
            },
          });

          return {
            ...token,
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: picture,
          };
        }

        // Normal sign in
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: picture,
        };
      } else if (account?.provider === "google") {
        const name = token.name;
        const email = token.email;
        const picture = token.picture;
        const user = await prisma.user.findUnique({
          where: {
            email: email!,
          },
        });
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
          const newUser = await prisma.user.create({
            data: {
              name,
              email: email!,
              isEmailVerified: true,
              password: await hash(name!, 10),
              image: picture,
              token: await hash(email!, 10),
              provider: "google",
            },
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
      if (trigger === "update") {
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
