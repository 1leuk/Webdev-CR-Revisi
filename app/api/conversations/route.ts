import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/auth";

// GET /api/conversations - Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id
          }
        }
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
                role: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Get unread message counts for each conversation
    const conversationsWithCounts = await Promise.all(conversations.map(async (conversation) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          receiverId: user.id,
          read: false
        }
      });

      return {
        ...conversation,
        lastMessage: conversation.messages[0] || null,
        unreadCount,
        messages: undefined // Remove the messages array since we only need lastMessage
      };
    }));

    return NextResponse.json(conversationsWithCounts);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated

    const body = await req.json();
    const { topic, userIds, initialMessage } = body;

    if (!topic || !userIds || userIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the current user is included in the conversation
    const uniqueUserIds = Array.from(new Set([...userIds, user.id]));

    // Create the conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        topic,
        participants: {
          create: uniqueUserIds.map(id => ({
            user: { connect: { id } }
          }))
        }
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
                role: true
              }
            }
          }
        }
      }
    });

    // If initial message is provided, add it to the conversation
    if (initialMessage) {
      const receiverIds = uniqueUserIds.filter(id => id !== user.id);

      // Create a message for each recipient
      if (receiverIds.length > 0) {
        await prisma.message.create({
          data: {
            content: initialMessage,
            senderId: user.id,
            receiverId: receiverIds[0], // For simplicity, send to the first user
            conversationId: conversation.id,
          }
        });
      } else {
        // If it's just the user talking to themselves or a note
        await prisma.message.create({
          data: {
            content: initialMessage,
            senderId: user.id,
            conversationId: conversation.id,
          }
        });
      }
    }

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
