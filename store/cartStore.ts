import { Product } from "@/types/types";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  loading: boolean;
  initialized: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number | string) => Promise<void>;
  updateQty: (action: "increment" | "decrement", productId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  syncLocalCartWithServer: () => Promise<void>;
  mergeLocalWithServerCart: () => Promise<void>;
}

// Helper to get cart from localStorage
const getLocalCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

// Helper to save cart to localStorage
const saveLocalCart = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      
      // Try to get the server cart
      const response = await fetch("/api/cart");
      
      // If not logged in, use the local cart
      if (response.status === 401) {
        const localCart = getLocalCart();
        set({ 
          items: localCart,
          initialized: true, 
          loading: false 
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const cart = await response.json();
      
      // Update the store with server cart
      set({ 
        items: cart.items || [], 
        initialized: true,
        loading: false 
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      
      // Fallback to local cart on error
      const localCart = getLocalCart();
      set({ 
        items: localCart,
        initialized: true, 
        loading: false 
      });
      
      toast.error("Failed to load your cart");
    }
  },

  syncLocalCartWithServer: async () => {
    // This function synchronizes the current local cart to the server
    // Used when a user logs in to ensure their local cart gets saved
    try {
      const localCart = getLocalCart();
      
      if (localCart.length === 0) return;
      
      // Loop through each item and add to server cart
      for (const item of localCart) {
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
          }),
        });
      }
      
      // Clear local cart after syncing
      localStorage.removeItem('cart');
      
      // Fetch the updated cart from server
      await get().fetchCart();
      
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  },

  mergeLocalWithServerCart: async () => {
    // Merge local cart with server cart when user logs in
    try {
      const localCart = getLocalCart();
      
      if (localCart.length === 0) {
        await get().fetchCart();
        return;
      }
      
      const response = await fetch("/api/cart");
      
      if (!response.ok) {
        throw new Error("Failed to fetch server cart");
      }
      
      const serverCart = await response.json();
      
      // For each local cart item, add it to server cart if not already there
      // or update quantity if it exists
      for (const localItem of localCart) {
        const serverItem = serverCart.items?.find((item: CartItem) => item.id === localItem.id);
        
        if (serverItem) {
          // Item exists, update quantity
          await fetch(`/api/cart/${localItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              action: "set",
              quantity: serverItem.quantity + localItem.quantity 
            }),
          });
        } else {
          // Item doesn't exist, add it
          await fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: localItem.id,
              quantity: localItem.quantity,
            }),
          });
        }
      }
      
      // Clear local cart after merging
      localStorage.removeItem('cart');
      
      // Fetch the updated cart from server
      await get().fetchCart();
    } catch (error) {
      console.error("Error merging carts:", error);
    }
  },

  addToCart: async (product: Product) => {
    try {
      set({ loading: true });
      
      // Initialize the cart if it hasn't been loaded yet
      if (!get().initialized) {
        await get().fetchCart();
      }
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });
      
      // If not logged in, handle locally
      if (response.status === 401) {
        const localCart = getLocalCart();
        const existingItemIndex = localCart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
          // If item exists, increment quantity
          localCart[existingItemIndex].quantity += 1;
        } else {
          // Add new item
          localCart.push({ ...product, quantity: 1 });
        }
        
        // Save to localStorage
        saveLocalCart(localCart);
        
        // Update store
        set({ 
          items: localCart,
          loading: false 
        });
        
        toast.success(`${product.title} added to cart`);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }
      
      // Re-fetch the entire cart to ensure consistency
      await get().fetchCart();
      
      toast.success(`${product.title} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
      set({ loading: false });
    }
  },

  removeFromCart: async (productId: number | string) => {
    try {
      set({ loading: true });
      
      // Initialize the cart if it hasn't been loaded yet
      if (!get().initialized) {
        await get().fetchCart();
      }
      
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });
      
      // If not logged in, handle locally
      if (response.status === 401) {
        const localCart = getLocalCart().filter(item => item.id !== productId);
        
        // Save to localStorage
        saveLocalCart(localCart);
        
        // Update store
        set({
          items: localCart,
          loading: false,
        });
        
        toast.success("Item removed from cart");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }
      
      // Re-fetch the entire cart to ensure consistency
      await get().fetchCart();
      
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
      set({ loading: false });
    }
  },

  updateQty: async (action: "increment" | "decrement", productId: number | string) => {
    try {
      set({ loading: true });
      
      // Initialize the cart if it hasn't been loaded yet
      if (!get().initialized) {
        await get().fetchCart();
      }
      
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      
      // If not logged in, handle locally
      if (response.status === 401) {
        const localCart = getLocalCart();
        const updatedLocalCart = localCart.map(item => {
          if (item.id !== productId) return item;
          
          if (action === "increment") {
            return { ...item, quantity: item.quantity + 1 };
          } else if (action === "decrement") {
            return { 
              ...item, 
              quantity: Math.max(1, item.quantity - 1) 
            };
          }
          
          return item;
        });
        
        // Save to localStorage
        saveLocalCart(updatedLocalCart);
        
        // Update store
        set({
          items: updatedLocalCart,
          loading: false,
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to update item quantity");
      }
      
      // Re-fetch the entire cart to ensure consistency
      await get().fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update item quantity");
      set({ loading: false });
    }
  },

  clearCart: async () => {
    try {
      set({ loading: true });
      
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });
      
      // If not logged in, handle locally
      if (response.status === 401) {
        // Clear localStorage
        localStorage.removeItem('cart');
        
        set({ items: [], loading: false });
        toast.success("Cart cleared");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }
      
      set({ items: [], loading: false });
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      set({ loading: false });
    }
  },
}));

export default useCartStore;