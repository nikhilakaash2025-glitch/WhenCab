import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/api/rides") ||
    req.nextUrl.pathname.startsWith("/api/conversations");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Belt-and-suspenders: a user suspended mid-session is locked out
  // immediately, not just on their next fresh login.
  if (isProtectedRoute && isLoggedIn && req.auth?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: req.auth.user.id },
      select: { isSuspended: true },
    });
    if (user?.isSuspended) {
      return NextResponse.redirect(new URL("/auth/error?reason=suspended", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/rides/:path*", "/api/conversations/:path*"],
};
