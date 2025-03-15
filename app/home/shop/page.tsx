"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/types";
import { getProducts, getCategories } from "@/app/actions/product";
import useCartStore from "@/store/cartStore";
import { Button } from "@/components/button";
import { Toaster } from "react-hot-toast";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToCart } = useCartStore((state) => state);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleViewProduct = (id: number) => {
    router.push(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b1d21] text-white">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24 bg-[#1b1d21] text-white">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Shop Our Products</h1>
        
        {/* Categories */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-[#2a2d33] rounded-full text-white hover:bg-gray-700 transition"
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-[#2a2d33] p-4 rounded-lg shadow-md cursor-pointer transition hover:shadow-lg"
                onClick={() => handleViewProduct(product.id)}
              >
                <div className="relative h-48 mb-4 rounded-md overflow-hidden bg-[#3b3f45] flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full object-contain"
                  />
                </div>
                <div className="h-16">
                  <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <span className="capitalize">{product.category}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1">{product.rating.rate}</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-white mt-1 mb-3">${product.price.toFixed(2)}</p>
                <div className="flex mt-4 space-x-2">
                  <Button
                    className="flex-grow border border-white text-white"
                    onClick={(e) => handleViewProduct(product.id)}
                    variant="outline"
                  >
                    View Details
                  </Button>
                  <Button
                    className="flex-grow bg-yellow-500 text-black hover:bg-yellow-600"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-xl text-gray-400">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
