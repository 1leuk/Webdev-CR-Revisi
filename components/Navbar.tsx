"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingCart, FiMessageSquare, FiUser, FiLogOut } from "react-icons/fi";
import useCartStore from "@/store/cartStore";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { items } = useCartStore((state) => state);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    if (session?.user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch("/api/messages/unread-count");
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      };

      fetchUnreadCount();

      // Set up interval to check for new messages
      const intervalId = setInterval(fetchUnreadCount, 30000); // every 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 text-white transition-all ${
        isScrolled ? "bg-gray-900 bg-opacity-95 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold tracking-wide">
          Fashion<span className="text-yellow-400">.com</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {[
            { name: "Home", path: "/home" },
            { name: "Shop", path: "/home/shop" },
            { name: "Discount", path: "/discount" },
            { name: "Team", path: "/team" },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative font-medium transition duration-300 ${
                pathname === item.path
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Chat Icon - Only show for logged in users */}
          {isAuthenticated && (
            <Link
              href="/chat"
              className="relative flex items-center group"
              aria-label="Messages"
            >
              <div className="relative p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all">
                <FiMessageSquare className="text-2xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-yellow-500 text-gray-900 rounded-full text-xs font-bold flex items-center justify-center min-w-5 h-5 px-1 shadow-md">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center group"
            aria-label="Shopping Cart"
          >
            <div className="relative p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all">
              <FiShoppingCart className="text-2xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-yellow-500 text-gray-900 rounded-full text-xs font-bold flex items-center justify-center min-w-5 h-5 px-1 shadow-md">
                  {cartItemCount}
                </span>
              )}
            </div>
          </Link>

          {/* Auth Links - Show different options based on auth state */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {session.user.image ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      width={32} 
                      height={32}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <FiUser className="text-lg" />
                  </div>
                )}
                <span className="text-sm font-medium">{session.user.name?.split(' ')[0] || 'User'}</span>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                  </div>
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    My Orders
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link 
                      href="/admin" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-yellow-500 text-black rounded-md font-medium hover:bg-yellow-400 transition"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Chat Icon for Mobile - Only show for logged in users */}
          {isAuthenticated && (
            <Link
              href="/chat"
              className="relative flex items-center"
              aria-label="Messages"
            >
              <div className="relative p-2 hover:text-yellow-400 transition">
                <FiMessageSquare className="text-2xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-yellow-500 text-gray-900 rounded-full text-xs font-bold flex items-center justify-center min-w-5 h-5 px-1 shadow-md">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Cart Icon for Mobile */}
          <Link
            href="/cart"
            className="relative flex items-center"
            aria-label="Shopping Cart"
          >
            <div className="relative p-2 hover:text-yellow-400 transition">
              <FiShoppingCart className="text-2xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-yellow-500 text-gray-900 rounded-full text-xs font-bold flex items-center justify-center min-w-5 h-5 px-1 shadow-md">
                  {cartItemCount}
                </span>
              )}
            </div>
          </Link>

          {/* Menu Toggle */}
          <button
            className="text-2xl text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-lg transform transition-all ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        } md:hidden`}
      >
        <div className="absolute right-0 w-64 bg-gray-900 shadow-lg h-full flex flex-col p-6">
          <button
            className="text-3xl text-white self-end"
            onClick={() => setIsOpen(false)}
          >
            <FiX />
          </button>

          {/* User Profile Section - Mobile */}
          {isAuthenticated && (
            <div className="mt-6 pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                {session.user.image ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      width={40} 
                      height={40}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <FiUser className="text-lg" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="mt-6 flex flex-col space-y-6">
            {[
              { name: "Home", path: "/home" },
              { name: "Shop", path: "/home/shop" },
              { name: "Discount", path: "/discount" },
              { name: "Team", path: "/team" },
              ...(isAuthenticated ? [
                { name: "Profile", path: "/profile" },
                { name: "My Orders", path: "/orders" },
                { name: "Chat", path: "/chat" },
                ...(session?.user?.role === "ADMIN" ? [{ name: "Admin Dashboard", path: "/admin" }] : [])
              ] : [
                { name: "Sign In", path: "/login" },
                { name: "Sign Up", path: "/register" }
              ]),
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-lg text-gray-300 hover:text-yellow-400 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Logout Button (Mobile) */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="text-lg text-red-400 hover:text-red-300 transition flex items-center"
              >
                <FiLogOut className="mr-2" />
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}