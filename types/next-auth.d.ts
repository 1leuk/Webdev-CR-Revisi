import "next-auth";
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

// Extend the default session types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string;
      image?: string | null;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string;
    image?: string | null;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string;
    picture?: string | null;
    role: Role;
  }
}
