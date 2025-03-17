"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function MessageNotification() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Check for new messages initially and then periodically
    const checkNewMessages = async () => {
      try {
        const response = await fetch("/api/messages/check-new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastChecked: lastChecked ? lastChecked.toISOString() : null,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          if (data.hasNewMessages) {
            setHasNewMessage(true);

            // Show toast notification
            toast(
              (t) => (
                <div
                  onClick={() => {
                    router.push("/chat");
                    toast.dismiss(t.id);
                  }}
                >
                  <div className="font-bold">New message received</div>
                  <div className="text-sm">Click to view</div>
                </div>
              ),
              {
                icon: "💬",
                duration: 5000,
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                  cursor: "pointer",
                },
              }
            );
          }

          // Update last checked time
          setLastChecked(new Date());
        }
      } catch (error) {
        console.error("Error checking for new messages:", error);
      }
    };

    // Check immediately on component mount
    checkNewMessages();

    // Set up interval to check periodically
    const intervalId = setInterval(checkNewMessages, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [session, router, lastChecked]);

  // This component doesn't render anything directly, it just manages notifications
  return null;
}
