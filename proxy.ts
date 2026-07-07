import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept admin workspace
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionToken = request.cookies.get("apsc_session")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const session = await decryptSession(sessionToken);
    if (!session) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("apsc_session");
      return response;
    }

    // Role validation: /admin/users is restricted to admins only
    if (pathname.startsWith("/admin/users") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
