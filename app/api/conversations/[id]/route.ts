import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";


// GET /api/conversations/[id] - Get a specific conversation with messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated
    const { id } = params;

    // Fetch conversation and include users through UserConversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or you don't have access" },
        { status: 404 }
      );
    }

    // Extract userIds and users
    const userIds = conversation.users.map((u) => u.userId);
    const users = conversation.users.map((p) => p.user);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        receiverId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ ...conversation, userIds, users });
  } catch (error) {
    console.error(`Error fetching conversation ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id] - Add a message to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await req.json();
    const { content, receiverId } = body;

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        users: {
          some: { userId: user.id },
        },
      },
      include: {
        users: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId,
        conversationId: id,
      },
      include: { sender: { select: { id: true, name: true, email: true, image: true, role: true } } },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Broadcast the new message
    await pusher.trigger(`conversation-${id}`, "new-message", message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}