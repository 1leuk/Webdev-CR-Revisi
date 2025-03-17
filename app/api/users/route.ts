import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/users - Get users for chat feature
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(); // Will redirect to login if not authenticated

    // Get the search query from URL params
    const searchQuery = req.nextUrl.searchParams.get("search") || "";

    // Get users based on search query, excluding current user
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
        ],
        NOT: {
          id: user.id, // Exclude current user
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      take: 10, // Limit results
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
