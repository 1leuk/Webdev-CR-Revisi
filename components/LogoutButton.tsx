// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/button";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function LogoutButton({ 
  className = "", 
  variant = "default", 
  size = "default" 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      <FiLogOut className="mr-2" />
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}