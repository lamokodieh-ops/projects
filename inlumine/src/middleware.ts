import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "SYSTEM_USER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (path.startsWith("/admin/users") || path.startsWith("/admin/alumni") || path.startsWith("/admin/analytics")) {
        if (role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }
    }

    if (path.startsWith("/social") && role === "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const publicPaths = ["/", "/login", "/register"];
        if (publicPaths.includes(path)) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/directory/:path*",
    "/connections/:path*",
    "/opportunities/:path*",
    "/social/:path*",
    "/college/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
