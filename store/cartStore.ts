import { Product } from "@/types/types";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  quantity: number;
  id: number;
  title: string;
  price: number;
  image: string;
}

interface CartSate {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQty: (type: "increment" | "decrement", id: number) => void;
}

const useCartStore = create<CartSate>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const existingProduct = get().items.find(
          (item) => item.id === product.id
        );

        if (existingProduct) {
          // If product already exists, increment quantity
          get().updateQty("increment", product.id);
          toast.success("Added one more to cart");
        } else {
          // Add new product to cart
          set({
            items: [
              ...get().items,
              {
                quantity: 1,
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image, // matching dengan API structure
              },
            ],
          });
          toast.success("Product added to cart");
        }
      },
      removeFromCart: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
        toast.success("Item removed from cart");
      },
      updateQty: (type, id) => {
        const item = get().items.find((item) => item.id === id);
        if (!item) {
          return;
        }

        if (item.quantity === 1 && type === "decrement") {
          get().removeFromCart(id);
        } else {
          item.quantity =
            type === "decrement" ? item.quantity - 1 : item.quantity + 1;
          set({
            items: [...get().items],
          });
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;
