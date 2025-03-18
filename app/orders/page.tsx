"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/types";
import { Button } from "@/components/button";
import { format } from "date-fns";
import {
  FiPackage,
  FiClock,
  FiCheck,
  FiTruck,
  FiXCircle,
  FiArrowLeft,
} from "react-icons/fi";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const response = await fetch("/api/orders");

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <FiClock className="text-yellow-400" />;
      case "PROCESSING":
        return <FiPackage className="text-blue-400" />;
      case "SHIPPED":
        return <FiTruck className="text-indigo-400" />;
      case "DELIVERED":
        return <FiCheck className="text-green-400" />;
      case "CANCELLED":
        return <FiXCircle className="text-red-400" />;
      default:
        return <FiClock className="text-gray-400" />;
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

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-10 px-4 text-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.push("/profile")}
            className="mr-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to Profile
          </Button>
          <h1 className="text-3xl font-bold">Your Orders</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-400 mb-6">
              You haven't placed any orders yet. Start shopping to see your
              order history here.
            </p>
            <Button
              onClick={() => router.push("/home/shop")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="p-6 cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-xl font-semibold">
                          Order #{order.invoiceId}
                        </h3>
                        <span
                          className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          <span className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Placed on{" "}
                        {format(
                          new Date(order.createdAt),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="text-lg font-bold">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex flex-wrap gap-4">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="h-16 w-16 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="text-sm">
                            <p className="line-clamp-1">{item.product.title}</p>
                            <p className="text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}

                      {order.items.length > 3 && (
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm">
                            +{order.items.length - 3} more items
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-right">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/orders/${order.id}`);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
