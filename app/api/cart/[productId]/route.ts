import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/cart/[productId] - Update cart item quantity
export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { productId } = params;
    const body = await req.json();
    const { action } = body; // 'increment', 'decrement', or 'set'
    const quantityToSet = body.quantity;
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });
    
    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }
    
    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }
    
    let newQuantity = cartItem.quantity;
    
    // Update quantity based on action
    if (action === 'increment') {
      newQuantity += 1;
    } else if (action === 'decrement') {
      newQuantity = Math.max(1, cartItem.quantity - 1);
    } else if (action === 'set' && typeof quantityToSet === 'number') {
      newQuantity = Math.max(1, quantityToSet);
    }
    
    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: true,
      },
    });
    
    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[productId] - Remove item from cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { productId } = params;
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });
    
    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }
    
    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }
    
    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });
    
    return NextResponse.json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}