import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/verification";

// POST /api/verify-email - Request email verification
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal that the email doesn't exist
      return NextResponse.json(
        {
          message:
            "If your email is registered, you will receive a verification link",
        },
        { status: 200 }
      );
    }

    // If user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 200 }
      );
    }

    // Generate token and store in database
    const token = await generateVerificationToken(email);

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-email API:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
