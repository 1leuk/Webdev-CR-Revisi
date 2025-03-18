// app/api/auth/[...nextauth]/route.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";
import prisma from "@/lib/prisma";
import { Adapter } from "next-auth/adapters"; // Import the Adapter type from next-auth

// Use type assertion to tell TypeScript that our adapter matches the expected type
const adapter = PrismaAdapter(prisma) as unknown as Adapter;

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || "USER"; // Default to USER if no role is provided
        token.picture = user.image;
      }

      // If it's a first time sign in with OAuth, set their role to USER
      if (account && account.provider !== "credentials" && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name,
          image: token.picture,
          role: token.role as "USER" | "ADMIN",
        };
      }
      return session;
    },
    async signIn({ user, account }) {
      // Create a cart for new OAuth users if they don't have one
      if (account && account.provider !== "credentials" && user?.id) {
        try {
          const existingCart = await prisma.cart.findFirst({
            where: { userId: user.id },
          });

          if (!existingCart) {
            await prisma.cart.create({
              data: { userId: user.id },
            });
          }
        } catch (error) {
          console.error("Error creating cart for new user:", error);
        }
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXAUTH_SECRET, // Support both spellings
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
