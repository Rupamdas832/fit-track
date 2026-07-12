import { NextRequest, NextResponse } from "next/server";

// Better Auth uses __Secure- prefix on HTTPS (production), plain name on HTTP (dev)
const AUTH_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isLoggedIn = AUTH_COOKIES.some((name) => request.cookies.has(name));

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
