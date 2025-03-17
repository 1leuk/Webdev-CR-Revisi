import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/conversations/[id] - Get a specific conversation with messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated
    const { id } = params;

    // Fetch conversation and include participants
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
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
    const userIds = conversation.participants.map((p) => p.userId);
    const users = conversation.participants.map((p) => p.user);

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
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Fetch the conversation to check participation and get userIds
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
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

    // Extract userIds from participants
    const userIds = conversation.participants.map((p) => p.userId);

    // Determine the receiver
    const validReceiverId = userIds.includes(receiverId)
      ? receiverId
      : userIds.find((uid) => uid !== user.id) || null;

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId: validReceiverId,
        conversationId: id,
      },
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
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(`Error adding message to conversation ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to add message to conversation" },
      { status: 500 }
    );
  }
}

