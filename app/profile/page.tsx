"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiMail, FiShoppingBag, FiMessageSquare, FiEdit, FiSave } from "react-icons/fi";
import { Button } from "@/components/button";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Set initial name from session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/orders");
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
    };

    fetchOrders();
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    setLoading(true);
    
    try {
      // Update profile via API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
        },
      });
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-10 px-4 text-gray-200">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-col items-center mb-6">
                {session?.user?.image ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      width={96} 
                      height={96}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                    <FiUser size={48} />
                  </div>
                )}
                
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="w-full">
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center"
                        disabled={loading}
                      >
                        <FiSave className="mr-2" />
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-gray-700 hover:bg-gray-600"
                        onClick={() => {
                          setIsEditing(false);
                          setName(session?.user?.name || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{session?.user?.name || "User"}</h2>
                    <p className="text-gray-400 flex items-center mt-1">
                      <FiMail className="mr-2" />
                      {session?.user?.email}
                    </p>
                    <Button
                      className="mt-4 bg-gray-700 hover:bg-gray-600 flex items-center"
                      onClick={() => setIsEditing(true)}
                    >
                      <FiEdit className="mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Account Details</h3>
                <p className="text-sm text-gray-400 mb-1">
                  Role: <span className="text-white">{session?.user?.role || "User"}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Account Type: <span className="text-white">
                    {session?.user?.image ? "Google Account" : "Email & Password"}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/orders" className="flex items-center p-2 hover:bg-gray-700 rounded">
                  <FiShoppingBag className="mr-3" />
                  My Orders
                </Link>
                <Link href="/chat" className="flex items-center p-2 hover:bg-gray-700 rounded">
                  <FiMessageSquare className="mr-3" />
                  Messages
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Link href="/orders" className="text-yellow-400 hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Order #{order.invoiceId}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === "DELIVERED" ? "bg-green-900 text-green-200" :
                          order.status === "PENDING" ? "bg-yellow-900 text-yellow-200" :
                          order.status === "CANCELLED" ? "bg-red-900 text-red-200" :
                          "bg-blue-900 text-blue-200"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Total: ${order.total.toFixed(2)}</p>
                        <p className="mt-1">Items: {order.items.length}</p>
                      </div>
                      <Button 
                        className="mt-2 text-xs py-1 h-auto bg-gray-600 hover:bg-gray-500"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiShoppingBag className="mx-auto text-4xl mb-2" />
                  <p>You haven't placed any orders yet</p>
                  <Button
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={() => router.push("/home/shop")}
                  >
                    Start Shopping
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}