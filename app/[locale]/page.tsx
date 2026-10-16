import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getCalendarEvents, getPublicContent } from "@/lib/db";
import { toEventCards } from "@/lib/events";
import { getSiteDict } from "@/lib/site-content";
import { Logo } from "./components/Logo";
import { HomeSections } from "./components/HomeSections";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = await getSiteDict(L);
  const [content, calendar] = await Promise.all([getPublicContent(), getCalendarEvents()]);
  // The homepage teases what is next; the full calendar lives on /events.
  const upcoming = toEventCards(calendar, L)
    .filter((e) => e.status !== "past")
    .slice(0, 3);

  return (
    <HomeSections
      dict={dict}
      locale={L}
      content={content}
      upcoming={upcoming}
      footer={
        <footer id="contact" className="w-full">
          {/* pb-16 leaves room for the pinned SiteCredit below the last line. */}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 pt-6 pb-16">
            <p className="text-xs text-ink-muted md:text-sm">
              © {new Date().getFullYear()} KNX Club Jordan. {dict.footer.rights}
            </p>
            <Logo className="h-7 w-auto" />
          </div>
        </footer>
      }
    />
  );
}
