import { NextResponse, type NextRequest } from "next/server";

// Lightweight cookie-presence check for fast UX redirects.
// The real auth verification (getUser()) runs in app/admin/layout.tsx.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/admin/login" || path.startsWith("/admin/auth/");

  if (!isAuthRoute) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
