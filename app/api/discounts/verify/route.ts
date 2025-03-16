import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/discounts/verify - Verify a discount code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      );
    }
    
    // Find discount by code
    const discount = await prisma.discount.findUnique({
      where: {
        code: code.toUpperCase(),
        active: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ]
      },
    });
    
    if (!discount) {
      return NextResponse.json(
        { error: "Invalid or expired discount code" },
        { status: 404 }
      );
    }
    
    // Check if minimum purchase requirement is met
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      return NextResponse.json(
        { 
          error: "Minimum purchase requirement not met",
          minPurchase: discount.minPurchase 
        },
        { status: 400 }
      );
    }
    
    // Return discount details
    return NextResponse.json({
      code: discount.code,
      rate: discount.rate,
      minPurchase: discount.minPurchase,
      description: discount.description,
      valid: true
    });
  } catch (error) {
    console.error("Error verifying discount:", error);
    return NextResponse.json(
      { error: "Failed to verify discount" },
      { status: 500 }
    );
  }
}