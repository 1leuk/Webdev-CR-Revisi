import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/messages/read - Mark messages as read
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated
    
    const body = await req.json();
    const { messageIds, conversationId } = body;
    
    if (!messageIds && !conversationId) {
      return NextResponse.json(
        { error: "Either messageIds or conversationId is required" },
        { status: 400 }
      );
    }
    
    // If messageIds is provided, mark specific messages as read
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: user.id,
          read: false
        },
        data: {
          read: true
        }
      });
    }
    
    // If conversationId is provided, mark all unread messages in that conversation as read
    if (conversationId) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: user.id,
          read: false
        },
        data: {
          read: true
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}