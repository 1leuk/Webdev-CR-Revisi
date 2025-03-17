import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/messages/unread-count - Get unread message count for current user
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated
    
    // Count all unread messages where the current user is the receiver
    const count = await prisma.message.count({
      where: {
        receiverId: user.id,
        read: false,
      },
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread message count" },
      { status: 500 }
    );
  }
}