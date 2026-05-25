import { NextResponse, type NextRequest } from "next/server";
import { locales } from "@/lib/i18n";

export const config = {
  matcher: ["/((?!_next|api|admin|favicon.ico|knx-logo|.*\\..*).*)"],
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
