import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  return user;
}

export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session.user;
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const hashedPassword = await hashPassword(password);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: Role.USER,
    },
  });

  // Create cart for the user
  await prisma.cart.create({
    data: {
      userId: user.id,
    },
  });

  return user;
}