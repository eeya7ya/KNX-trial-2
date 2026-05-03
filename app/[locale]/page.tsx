import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getPublicContent } from "@/lib/db";
import { Header } from "./components/Header";
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
  const dict = getDict(L);
  const content = await getPublicContent();

  return (
    <HomeSections
      dict={dict}
      locale={L}
      content={content}
      header={<Header dict={dict} locale={L} />}
      footer={
        <footer id="contact" className="w-full">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
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
