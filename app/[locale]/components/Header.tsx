import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeCord } from "./ThemeCord";
import type { Dict, Locale } from "@/lib/i18n";

export function Header({ dict, locale }: { dict: Dict; locale: Locale }) {
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Logo className="h-8 w-auto" />
          <span className="sr-only">KNX Club Jordan</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-muted lg:flex">
          <Link href={`/${locale}/about`} className="transition hover:text-ink">
            {dict.nav.about}
          </Link>
          <Link href={`/${locale}/services`} className="transition hover:text-ink">
            {dict.nav.services}
          </Link>
          <Link href={`/${locale}/events`} className="transition hover:text-ink">
            {dict.nav.events}
          </Link>
          <Link href={`/${locale}/members`} className="transition hover:text-ink">
            {dict.nav.members}
          </Link>
          <Link href={`/${locale}/news`} className="transition hover:text-ink">
            {dict.nav.news}
          </Link>
          <Link href={`/${locale}/gallery`} className="transition hover:text-ink">
            {dict.nav.gallery}
          </Link>
          <Link href={`/${locale}/faq`} className="transition hover:text-ink">
            {dict.nav.faq}
          </Link>
          <Link href={`/${locale}#join`} className="transition hover:text-ink">
            {dict.nav.join}
          </Link>
          <Link href={`/${locale}#contact`} className="transition hover:text-ink">
            {dict.nav.contact}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={`/${otherLocale}`}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
            aria-label={`Switch to ${otherLocale}`}
          >
            {dict.nav.switchTo}
          </Link>
          <Link
            href={`/${locale}#join`}
            className="hidden rounded-full bg-cta px-4 py-2 text-xs font-semibold text-cta-ink transition hover:bg-cta-hover sm:inline-block"
          >
            {dict.nav.join}
          </Link>
        </div>
      </div>
      {/* The pull hangs from the header's bottom edge, aligned with the
          inline-end of the same content column the Join button sits in — so it
          belongs to the header instead of floating at the edge of the window,
          and it mirrors with the language for free. */}
      <div className="pointer-events-none absolute inset-x-0 top-full">
        <div className="mx-auto flex max-w-7xl justify-end px-6">
          <ThemeCord labels={dict.theme} />
        </div>
      </div>
    </header>
  );
}
