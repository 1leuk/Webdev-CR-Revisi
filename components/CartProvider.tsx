// components/CartProvider.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useCartStore from "@/store/cartStore";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const { fetchCart, mergeLocalWithServerCart } = useCartStore();
  
  // Fetch cart when component mounts or auth state changes
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "authenticated") {
      // User is logged in, merge local cart with server cart
      mergeLocalWithServerCart();
    } else {
      // User is not logged in, just fetch cart (will get local cart)
      fetchCart();
    }
  }, [status, fetchCart, mergeLocalWithServerCart]);

  return <>{children}</>;
}