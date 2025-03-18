"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { toast, Toaster } from "react-hot-toast";
import { FiMail, FiCheck, FiX, FiLoader } from "react-icons/fi";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Extract email and token from URL if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (tokenParam) {
      setToken(tokenParam);
      // If both email and token are in URL, auto-verify
      if (emailParam) {
        handleVerifyWithToken(emailParam, tokenParam);
      }
    }
  }, [searchParams]);

  // Function to request verification email
  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send verification email");
      }

      toast.success("Verification email sent! Please check your inbox.");
      setVerificationState("pending");
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast.error(
        (error as Error).message || "Failed to send verification email"
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to verify email with token
  const handleVerifyWithToken = async (
    emailValue: string,
    tokenValue: string
  ) => {
    setLoading(true);
    setVerificationState("pending");

    try {
      const response = await fetch("/api/verify-email/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailValue, token: tokenValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify email");
      }

      setVerificationState("success");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Error verifying email:", error);
      setErrorMessage((error as Error).message || "Failed to verify email");
      setVerificationState("error");
    } finally {
      setLoading(false);
    }
  };

  // Render different UI based on verification state
  const renderVerificationUI = () => {
    switch (verificationState) {
      case "idle":
        return (
          <div className="text-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <FiMail className="text-6xl text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
              <p className="text-gray-400 mb-6">
                Enter your email address below and we'll send you a verification
                link.
              </p>

              <form onSubmit={handleRequestVerification} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-md"
                >
                  {loading ? "Sending..." : "Send Verification Email"}
                </Button>
              </form>

              <p className="mt-6 text-gray-400 text-sm">
                Already verified?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-yellow-500 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="text-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <FiLoader className="text-6xl text-yellow-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-4">Verifying Your Email</h2>
              <p className="text-gray-400 mb-6">
                Please wait while we verify your email address...
              </p>

              {token ? (
                <p className="text-gray-300">
                  Validating your verification token.
                </p>
              ) : (
                <p className="text-gray-300">
                  We've sent a verification link to <strong>{email}</strong>.
                  Please check your inbox and click the link to complete
                  verification.
                </p>
              )}
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <FiCheck className="text-6xl text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
              <p className="text-gray-300 mb-6">
                Your email has been successfully verified. You can now log in to
                your account.
              </p>

              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-md"
              >
                Proceed to Login
              </Button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <FiX className="text-6xl text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
              <p className="text-gray-300 mb-6">
                {errorMessage ||
                  "We couldn't verify your email. The verification link may have expired or is invalid."}
              </p>

              <Button
                onClick={() => {
                  setVerificationState("idle");
                  setErrorMessage("");
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-md"
              >
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">{renderVerificationUI()}</div>
    </div>
  );
}
