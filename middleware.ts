import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;
    const isAdmin = token?.role === "ADMIN";
    const pathname = req.nextUrl.pathname;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    // Handle admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run this middleware on protected routes
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes this middleware should apply to
export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};