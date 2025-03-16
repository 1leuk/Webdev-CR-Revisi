import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/categories - Get all unique categories
export async function GET() {
  try {
    // Find all unique categories from products
    const productsWithCategories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    
    // Extract categories into an array
    const categories = productsWithCategories.map(product => product.category);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}