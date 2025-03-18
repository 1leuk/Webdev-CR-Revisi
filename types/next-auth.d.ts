// File: types/next-auth.d.ts
import "next-auth";
import { Role } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";

// Extend the AdapterUser type to include role
declare module "next-auth/adapters" {
  interface AdapterUser {
    role: Role;
    id: string;
    email: string;
    emailVerified?: Date | null;
    name?: string | null;
    image?: string | null;
  }
}

// Augment the default NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    image?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role;
    };
  }
}

// If you're using JWT strategy, augment the JWT as well
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role: Role;
  }
}