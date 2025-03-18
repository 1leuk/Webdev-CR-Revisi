"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Login failed");
      } else {
        toast.success("Login successful!");
        router.push("/home");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/home" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <Toaster position="top-right" />
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-yellow-500 text-center mb-6">
          Welcome Back
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Sign in to continue your shopping experience.
        </p>
        
        {/* OAuth Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white text-gray-800 py-3 rounded-md font-bold hover:bg-gray-100 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mb-4"
        >
          <FcGoogle className="mr-2 text-xl" />
          Sign in with Google
        </button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 text-black py-3 rounded-md font-bold hover:bg-yellow-600 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FiMail className="mr-2" />
            {isLoading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>
        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-yellow-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}