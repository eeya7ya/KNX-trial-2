import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { formatWindowDate, getWebinarAssignCopy } from "@/lib/webinar-assign-copy";
import { WINDOW_FIRST, WINDOW_LAST } from "@/lib/webinars";
import { getTakenDates } from "@/lib/webinars-db";
import { Logo } from "../components/Logo";
import { ThemeCord } from "../components/ThemeCord";
import { WebinarAssignForm } from "../components/WebinarAssignForm";

// Booked days have to be current on every load, or the picker offers a day the
// API will refuse.
export const dynamic = "force-dynamic";

// A temporary page for invited presenters — it is linked to directly, not
// crawled, and it is deliberately absent from the sitemap.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function WebinarsAssignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const other: Locale = L === "ar" ? "en" : "ar";
  const dict = getDict(L);
  const copy = getWebinarAssignCopy(L);
  const taken = await getTakenDates();

  const windowLabel = copy.window
    .replace("{first}", formatWindowDate(WINDOW_FIRST, copy))
    .replace("{last}", formatWindowDate(WINDOW_LAST, copy));

  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      {/* The design keeps the page free of the site nav — a presenter arrives
          here from a link with one thing to do. What stays is the mark, the
          language pair and the pull cord. */}
      <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-line px-4 pt-3.5 md:px-20 md:pt-5">
        <Link href={`/${L}`} className="flex h-9 items-center md:h-11">
          <Logo className="h-7 w-auto md:h-9" />
          <span className="sr-only">KNX Club Jordan</span>
        </Link>
        <div className="flex items-start gap-5">
          <div
            role="group"
            aria-label={copy.langAria}
            className="flex h-11 items-center gap-1 rounded-full border border-line bg-card p-1"
          >
            <LangPill href={`/ar/WebinarsAssign`} active={L === "ar"} label="العربية" />
            <LangPill href={`/en/WebinarsAssign`} active={L === "en"} label="English" />
          </div>
          {/* The cord is 74px of line plus its knob and has to hang PAST the
              header's bottom edge, as it does everywhere else on the site. The
              fixed-height box reserves its width in the row; the absolute child
              keeps that length from stretching the header to fit. */}
          <div className="relative -mt-3.5 h-9 w-[26px] md:-mt-5 md:h-11">
            <div className="absolute top-0 start-0">
              <ThemeCord labels={dict.theme} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-grow flex-col gap-5 px-4 pt-7 pb-10 md:gap-7 md:px-6 md:pt-14 md:pb-18">
        <div className="flex max-w-3xl flex-col gap-3.5">
          <p className="text-[13px] font-semibold text-accent md:text-xs md:tracking-[0.14em]">
            {copy.eyebrow}
          </p>
          <h1 className="text-3xl font-bold leading-[1.04] tracking-tight text-ink md:text-5xl">
            {copy.h1}
          </h1>
          <p className="text-[17px] leading-relaxed text-ink-muted">{copy.sub}</p>
          <span className="inline-flex h-9 w-fit items-center rounded-full border border-line bg-accent-soft px-4 text-[13px] font-semibold text-accent">
            {windowLabel}
          </span>
        </div>

        <WebinarAssignForm locale={L} initialTaken={taken} />

        <Link
          href={`/${L}`}
          className="text-sm font-semibold text-accent transition hover:text-accent-strong"
        >
          {copy.backHome}
        </Link>
      </main>
    </div>
  );
}

function LangPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex h-9 items-center rounded-full px-4 text-sm font-semibold transition ${
        active ? "bg-cta text-cta-ink" : "text-ink-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
