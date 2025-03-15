"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";

export default function SuccessPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("your email");
  const [invoiceId, setInvoiceId] = useState("######");
  const [total, setTotal] = useState("0.00");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      
      setEmail(searchParams.get("email") || "your email");
      setInvoiceId(searchParams.get("invoiceId") || "######");
      setTotal(searchParams.get("total") || "0.00");

      try {
        const cartItems = searchParams.get("items");
        setItems(cartItems ? JSON.parse(cartItems) : []);
      } catch (error) {
        console.error("Failed to parse cart items:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-gray-300 px-4">
      <div className="max-w-2xl w-full bg-[#1a1f2e] p-8 rounded-lg shadow-lg text-center">
        <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-100">Order Confirmed!</h1>
        <p className="text-gray-400 mt-2">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Invoice Message */}
        <div className="bg-[#2d3445] p-4 rounded-md mt-6">
          <p className="text-gray-300 text-sm">
            Your invoice <span className="font-bold">#{invoiceId}</span> has been sent to{" "}
            <span className="font-bold">{email}</span>.
          </p>
        </div>

        {/* Order Summary */}
        <div className="mt-6 text-left">
          <h2 className="text-lg font-semibold text-gray-200">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-[#0a0f1e] p-3 rounded-md">
                  <div className="flex items-center space-x-3">
                    <img src={item.img} alt={item.title} className="h-12 w-12 rounded-md object-cover" />
                    <div>
                      <p className="text-gray-200 font-medium">{item.title}</p>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-gray-200 font-medium">${item.price.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No items found.</p>
            )}
          </div>
          <p className="mt-4 text-gray-300 font-medium text-right">
            <span className="text-gray-400">Total:</span> ${total}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md font-medium"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-md"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}
