import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/discussions/[id] - Get a specific discussion
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Fetch the discussion with user info and comment count
    const discussion = await prisma.discussion.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    
    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(discussion);
  } catch (error) {
    console.error(`Error fetching discussion ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch discussion" },
      { status: 500 }
    );
  }
}