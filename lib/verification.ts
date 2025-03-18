import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

// Generate a random token
export async function generateVerificationToken(
  identifier: string
): Promise<string> {
  // Delete any existing tokens for this identifier
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  // Generate a random token
  const token = randomBytes(32).toString("hex");

  // Set expiry to 24 hours from now
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store in database
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return token;
}

// Verify a token
export async function verifyToken(
  identifier: string,
  token: string
): Promise<boolean> {
  // Find the token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      token,
      expires: {
        gt: new Date(),
      },
    },
  });

  // If no token found or token expired
  if (!verificationToken) {
    return false;
  }

  // Delete the token to prevent reuse
  await prisma.verificationToken.delete({
    where: {
      id: verificationToken.id,
    },
  });

  return true;
}

// Create a verification email endpoint
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  // In a real application, you would send an actual email here
  // For now, we'll just log it
  console.log(`Sending verification email to ${email} with token ${token}`);

  // The email would typically include a link like:
  // https://yourdomain.com/verify-email?email=${encodeURIComponent(email)}&token=${token}
}
