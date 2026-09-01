import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (pathname === "/login" || pathname === "/") {
    if (session) {
      const role = (session.user as any)?.role;
      const redirectMap: Record<string, string> = {
        OPERATOR: "/operator",
        DUKUH: "/dukuh",
        RT: "/rt",
      };
      return NextResponse.redirect(
        new URL(redirectMap[role] ?? "/login", req.url)
      );
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (session.user as any)?.role;

  // Role-based access
  if (pathname.startsWith("/operator") && role !== "OPERATOR") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/dukuh") && role !== "DUKUH") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/rt") && role !== "RT") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

