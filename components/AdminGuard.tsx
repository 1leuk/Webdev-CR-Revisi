"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    }
  });

  // Loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Check if user is an admin
  if (session?.user?.role !== "ADMIN") {
    redirect('/');
  }

  return <>{children}</>;
}