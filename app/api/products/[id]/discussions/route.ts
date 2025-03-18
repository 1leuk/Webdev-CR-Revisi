import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/products/[id]/discussions - Get discussions for a product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Fetch discussions with user info and comment count
    const discussions = await prisma.discussion.findMany({
      where: {
        productId: id,
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
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(discussions);
  } catch (error) {
    console.error(`Error fetching discussions for product ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/discussions - Create a discussion for a product
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const { title, content } = await req.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Create the discussion
    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        userId: user.id,
        productId: id,
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
      },
    });
    
    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error(`Error creating discussion for product ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}