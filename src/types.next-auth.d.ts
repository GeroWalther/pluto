import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string;
    };
  }
}
