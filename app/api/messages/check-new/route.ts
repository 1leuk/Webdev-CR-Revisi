import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/messages/check-new - Check for new messages since lastChecked
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated

    const body = await req.json();
    const { lastChecked } = body;

    // Default to 1 minute ago if lastChecked not provided
    const checkTime = lastChecked
      ? new Date(lastChecked)
      : new Date(Date.now() - 60000); // 1 minute ago

    // Check if there are any new messages after lastChecked time
    const newMessagesCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        createdAt: {
          gt: checkTime,
        },
        read: false,
      },
    });

    return NextResponse.json({
      hasNewMessages: newMessagesCount > 0,
      count: newMessagesCount,
    });
  } catch (error) {
    console.error("Error checking for new messages:", error);
    return NextResponse.json(
      { error: "Failed to check for new messages" },
      { status: 500 }
    );
  }
}
