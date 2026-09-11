import { NextResponse, type NextRequest } from "next/server";
import { locales } from "@/lib/i18n";

export const config = {
  // Anything listed here is served as-is instead of being rewritten under a
  // locale. The generated icon routes (app/icon.tsx, app/apple-icon.tsx and the
  // /icon-* handlers the web manifest points at) have no file extension, so
  // without naming them they were rewritten to /ar/icon and answered 404 —
  // which left the site with no favicon at all for browsers or for Google.
  matcher: [
    "/((?!_next|api|admin|favicon.ico|icon|apple-icon|knx-logo|.*\\..*).*)",
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) {
    const headers = new Headers(req.headers);
    headers.set("x-knx-path", pathname);
    return NextResponse.next({ request: { headers } });
  }

  const localePath = `/ar${pathname === "/" ? "" : pathname}`;
  const url = req.nextUrl.clone();
  url.pathname = localePath;
  const headers = new Headers(req.headers);
  headers.set("x-knx-path", localePath);
  return NextResponse.rewrite(url, { request: { headers } });
}
