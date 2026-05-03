import Link from "next/link";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Logo } from "./Logo";
import type { Dict, Locale } from "@/lib/i18n";
import { IconArrow } from "./Icons";

export function DetailPageShell({
  dict,
  locale,
  children,
}: {
  dict: Dict;
  locale: Locale;
  children: ReactNode;
}) {
  const backLabel = dict.dir === "rtl" ? "العودة إلى الصفحة الرئيسية" : "Back to home";
  return (
    <div className="knx-animated-bg flex min-h-svh flex-col">
      <Header dict={dict} locale={locale} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 md:py-16">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-knx-700 transition hover:text-knx-800"
        >
          <IconArrow
            className="h-4 w-4"
            dir={dict.dir === "rtl" ? "ltr" : "rtl"}
          />
          {backLabel}
        </Link>
        <div className="mt-8">{children}</div>
      </main>
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <p className="text-xs text-ink-muted md:text-sm">
            © {new Date().getFullYear()} KNX Club Jordan. {dict.footer.rights}
          </p>
          <Logo className="h-7 w-auto" />
        </div>
      </footer>
    </div>
  );
}
