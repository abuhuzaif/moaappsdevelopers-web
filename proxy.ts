import { NextRequest, NextResponse } from "next/server";

// Hostnames that should serve the /ksa-connect app at the root ("/")
const KSA_HOSTS = ["myksaconnect.com", "www.myksaconnect.com"];

export function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  const isKsaHost = KSA_HOSTS.some(
    (h) => hostname === h || hostname.startsWith(`${h}:`)
  );

  // Not myksaconnect.com -> behave normally (moaappsdevelopers.com untouched)
  if (!isKsaHost) {
    return NextResponse.next();
  }

  // Already targeting /ksa-connect (or a sub-route) -> no rewrite needed
  if (pathname.startsWith("/ksa-connect")) {
    return NextResponse.next();
  }

  // myksaconnect.com/  -> /ksa-connect
  // myksaconnect.com/post -> /ksa-connect/post
  const url = req.nextUrl.clone();
  url.pathname = `/ksa-connect${pathname === "/" ? "" : pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Run on every path except static assets, Next internals, and known files
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|images/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)$).*)",
  ],
};
