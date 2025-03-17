import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting seed...");

    // Clean up existing data
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.discount.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users
    console.log("Creating users...");
    const adminPassword = await hashPassword("admin123");
    const userPassword = await hashPassword("user123");

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        name: "Regular User",
        email: "user@example.com",
        password: userPassword,
        role: "USER",
      },
    });

    // Create carts for users
    console.log("Creating carts...");
    await prisma.cart.create({
      data: {
        userId: admin.id,
      },
    });

    await prisma.cart.create({
      data: {
        userId: regularUser.id,
      },
    });

    // Fetch data from FakeStoreAPI
    console.log("Fetching products...");
    const response = await fetch("https://fakestoreapi.com/products");
    const productsData = await response.json();

    // Add products to database
    console.log("Creating products...");
    for (const product of productsData) {
      await prisma.product.create({
        data: {
          title: product.title,
          price: product.price,
          description: product.description,
          category: product.category,
          image: product.image,
          rating: {
            rate: product.rating.rate,
            count: product.rating.count,
          },
        },
      });
    }

    // Create discounts
    console.log("Creating discounts...");
    const discounts = [
      {
        code: "MARET10",
        rate: 0.1,
        minPurchase: null,
        description: "Get 10% off your entire order with no minimum purchase",
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        category: "general",
      },
      {
        code: "MARET20",
        rate: 0.2,
        minPurchase: 100,
        description: "Get 20% off when you spend $100 or more",
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        category: "general",
      },
      {
        code: "KELOMPOK1",
        rate: 0.15,
        minPurchase: null,
        description: "New customer? Get 15% off your first order",
        expiryDate: null,
        category: "new customers",
      },
      {
        code: "GRATIS",
        rate: 0.05,
        minPurchase: null,
        description: "5% discount on all orders, no minimum required",
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        category: "shipping",
      },
      {
        code: "CPS",
        rate: 0.25,
        minPurchase: 150,
        description: "25% off when you spend $150 or more",
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        category: "seasonal",
      },
    ];

    for (const discount of discounts) {
      await prisma.discount.create({
        data: discount,
      });
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
