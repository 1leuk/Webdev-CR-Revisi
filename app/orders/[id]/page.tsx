"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/types";
import { Button } from "@/components/button";
import { format } from "date-fns";
import {
  FiArrowLeft,
  FiPackage,
  FiClock,
  FiCheck,
  FiTruck,
  FiXCircle,
  FiMapPin,
} from "react-icons/fi";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${params.id}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }

          if (response.status === 404) {
            router.push("/orders");
            return;
          }

          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id, router]);

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <FiClock size={20} />;
      case "PROCESSING":
        return <FiPackage size={20} />;
      case "SHIPPED":
        return <FiTruck size={20} />;
      case "DELIVERED":
        return <FiCheck size={20} />;
      case "CANCELLED":
        return <FiXCircle size={20} />;
      default:
        return <FiClock size={20} />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-900 text-yellow-200";
      case "PROCESSING":
        return "bg-blue-900 text-blue-200";
      case "SHIPPED":
        return "bg-indigo-900 text-indigo-200";
      case "DELIVERED":
        return "bg-green-900 text-green-200";
      case "CANCELLED":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-900 text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Order not found
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          We couldn't find the order you're looking for. It may have been
          removed or the link might be incorrect.
        </p>
        <Button
          onClick={() => router.push("/orders")}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          View All Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-10 px-4 text-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.push("/orders")}
            className="mr-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Order #{order.invoiceId}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Placed on{" "}
                    {format(
                      new Date(order.createdAt),
                      "MMMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div
                  className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg flex items-center ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-medium">{order.status}</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-700 last:border-0"
                    >
                      <div className="flex-shrink-0 h-20 w-20 bg-gray-700 rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-gray-400 text-sm">
                          Category: {item.product.category}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-semibold">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FiMapPin className="mr-2" /> Shipping Address
              </h3>
              <div className="text-gray-300">
                <p>{order.address.street}</p>
                <p>
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.zip}
                </p>
                <p>{order.address.country}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-medium">Contact Information</h4>
                <p className="text-gray-300">{order.email}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${(order.total / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (10%)</span>
                  <span>${(order.total - order.total / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-white text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => router.push("/orders")}
                  className="w-full bg-gray-700 hover:bg-gray-600"
                >
                  Return to Orders
                </Button>

                <Button
                  onClick={() => router.push("/home/shop")}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
