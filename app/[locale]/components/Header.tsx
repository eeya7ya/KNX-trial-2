"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import type { Dict, Locale } from "@/lib/i18n";

export type HeaderDetailKey = "about" | "services" | "events" | "members" | "faq";

export function Header({
  dict,
  locale,
  onOpenDetail,
}: {
  dict: Dict;
  locale: Locale;
  onOpenDetail?: (key: HeaderDetailKey) => void;
}) {
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  const open = (key: HeaderDetailKey) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onOpenDetail) return;
    e.preventDefault();
    onOpenDetail(key);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Logo className="h-8 w-auto" />
          <span className="sr-only">KNX Club Jordan</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-muted lg:flex">
          <a href="#about" onClick={open("about")} className="transition hover:text-ink">
            {dict.nav.about}
          </a>
          <a href="#services" onClick={open("services")} className="transition hover:text-ink">
            {dict.nav.services}
          </a>
          <a href="#events" onClick={open("events")} className="transition hover:text-ink">
            {dict.nav.events}
          </a>
          <a href="#members" onClick={open("members")} className="transition hover:text-ink">
            {dict.nav.members}
          </a>
          <a href="#faq" onClick={open("faq")} className="transition hover:text-ink">
            {dict.nav.faq}
          </a>
          <a href="#join" className="transition hover:text-ink">
            {dict.nav.join}
          </a>
          <a href="#contact" className="transition hover:text-ink">
            {dict.nav.contact}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={`/${otherLocale}`}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
            aria-label={`Switch to ${otherLocale}`}
          >
            {dict.nav.switchTo}
          </Link>
          <a
            href="#join"
            className="hidden rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-knx-700 sm:inline-block"
          >
            {dict.nav.join}
          </a>
        </div>
      </div>
    </header>
  );
}
