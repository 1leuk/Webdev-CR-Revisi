import { Product } from "@/types/types";
import { create } from "zustand";
import { toast } from "react-hot-toast";

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
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      
      const response = await fetch("/api/cart");
      
      // If not logged in, use the local cart
      if (response.status === 401) {
        set({ initialized: true, loading: false });
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const cart = await response.json();
      set({ 
        items: cart.items || [], 
        initialized: true,
        loading: false 
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load your cart");
      set({ loading: false, initialized: true });
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
        const existingItem = get().items.find(item => item.id === product.id);
        
        if (existingItem) {
          // If item exists, increment quantity
          set(state => ({
            items: state.items.map(item =>
              item.id === product.id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ),
            loading: false,
          }));
        } else {
          // Add new item
          set(state => ({
            items: [...state.items, { ...product, quantity: 1 }],
            loading: false,
          }));
        }
        
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
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
          loading: false,
        }));
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
        set(state => ({
          items: state.items.map(item => {
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
          }),
          loading: false,
        }));
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