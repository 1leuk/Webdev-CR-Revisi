"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/types";
import { Button } from "@/components/button";
import { Toaster, toast } from "react-hot-toast";
import { format } from "date-fns";
import useCartStore from "@/store/cartStore";
import { Discussion } from "@/types/discussions";
import { useSession } from "next-auth/react";
import { 
  FiArrowLeft, FiStar, FiShoppingCart, FiMessageCircle, 
  FiPlus, FiUser, FiMessageSquare, FiChevronRight
} from "react-icons/fi";
import ProductDiscussions from "@/components/product/ProductDiscussions";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "discussions">("details");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Product not found");
            router.push("/home/shop");
            return;
          }
          throw new Error("Failed to fetch product");
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  useEffect(() => {
    // Fetch discussions when tab is switched to discussions
    if (activeTab === "discussions" && params.id) {
      fetchDiscussions();
    }
  }, [activeTab, params.id]);

  async function fetchDiscussions() {
    try {
      setLoadingDiscussions(true);
      const response = await fetch(`/api/products/${params.id}/discussions`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch discussions");
      }
      
      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast.error("Failed to load discussions");
    } finally {
      setLoadingDiscussions(false);
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.title} added to cart`);
    }
  };

  // Function to refresh discussions after adding a new one
  const refreshDiscussions = () => {
    fetchDiscussions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-semibold text-white mb-2">Product not found</h2>
        <p className="text-gray-400 mb-6 text-center">
          The product you're looking for may have been removed or the link is incorrect.
        </p>
        <Button
          onClick={() => router.push("/home/shop")}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-10 px-4 text-gray-200">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.push("/home/shop")}
            className="mr-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to Shop
          </Button>
          <h1 className="text-xl md:text-3xl font-bold line-clamp-1">{product.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="rounded-lg overflow-hidden bg-gray-800 p-8 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.title}
              className="max-h-96 object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{product.title}</h2>
                    <p className="text-gray-400 capitalize">{product.category}</p>
                  </div>
                  <span className="text-3xl font-bold text-yellow-500">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-2">
                    <FiStar className="text-yellow-400 mr-1" />
                    <span className="font-medium">{product.rating.rate}</span>
                  </div>
                  <span className="text-gray-400">({product.rating.count} reviews)</span>
                </div>
                  
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-300">{product.description}</p>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-md font-bold"
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === "details"
                  ? "border-b-2 border-yellow-500 text-yellow-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Product Details
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium flex items-center justify-center ${
                activeTab === "discussions"
                  ? "border-b-2 border-yellow-500 text-yellow-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("discussions")}
            >
              <FiMessageCircle className="mr-2" />
              Discussions
              <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">
                {discussions.length}
              </span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === "details" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Specifications</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Category</span>
                      <span className="capitalize">{product.category}</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Rating</span>
                      <span className="flex items-center">
                        <FiStar className="text-yellow-400 mr-1" />
                        {product.rating.rate} ({product.rating.count} reviews)
                      </span>
                    </li>
                    <li className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Price</span>
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Full Description</h3>
                  <p className="text-gray-300">{product.description}</p>
                </div>
              </div>
            ) : (
              <ProductDiscussions 
                productId={params.id} 
                discussions={discussions} 
                loading={loadingDiscussions} 
                refreshDiscussions={refreshDiscussions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}