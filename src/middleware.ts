import { NextResponse, type NextRequest } from "next/server";

// A quick, cheap redirect for visitors with no session cookie at all.
// It does NOT decide who may see what: every page and action re-checks the
// session and role on the server (see lib/auth.ts).
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has("zw_session")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/reservations/:path*", "/account/:path*", "/admin/:path*"],
};
