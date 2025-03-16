"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b1d21] via-[#14161c] to-[#0a0f1e] opacity-90"></div>

      {/* Subtle Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center max-w-xl px-6"
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
          Welcome to Fashion.com
        </h1>
        <p className="text-lg text-gray-300 mt-4">
          Discover exclusive products, unbeatable deals, and a seamless shopping
          experience.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            className="px-6 py-3 text-black font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => router.push("/team")}
          >
            Know the Team
          </button>
          <button
            className="px-6 py-3 text-white font-semibold bg-gray-800 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-700"
            onClick={() => router.push("/home")}
          >
            Go to Homepage
          </button>
          <button
            className="px-6 py-3 text-black font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </div>
      </motion.div>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f1e] to-transparent"></div>
    </div>
  );
}
