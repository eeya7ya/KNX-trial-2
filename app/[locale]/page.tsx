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
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <div>
              <p className="text-xs text-ink-muted md:text-sm">
                © {new Date().getFullYear()} KNX Club Jordan. {dict.footer.rights}
              </p>
              <a
                href="https://espark.dev"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="mt-1 block text-xs text-ink-muted/70 transition hover:text-ink-muted"
              >
                Designed by{" "}
                <span className="font-semibold text-accent">espark.dev</span>
              </a>
            </div>
            <Logo className="h-7 w-auto" />
          </div>
        </footer>
      }
    />
  );
}
