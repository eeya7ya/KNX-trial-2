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
  if (hasLocale) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/ar${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}
