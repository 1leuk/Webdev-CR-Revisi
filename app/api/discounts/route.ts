import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/discounts - Get all active discounts
export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      where: {
        active: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

// POST /api/discounts - Create a new discount (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { code, rate, minPurchase, description, expiryDate, category } = body;
    
    if (!code || !rate || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if discount code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { code },
    });
    
    if (existingDiscount) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      );
    }
    
    // Create new discount
    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        rate: parseFloat(rate),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        description,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        category,
        active: true,
      },
    });
    
    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}