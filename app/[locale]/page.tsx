import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { Header } from "./components/Header";
import { Logo } from "./components/Logo";
import { HomeSections } from "./components/HomeSections";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);

  return (
    <HomeSections
      dict={dict}
      locale={L}
      header={<Header dict={dict} locale={L} />}
      footer={
        <footer id="contact" className="w-full">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
            <div>
              <Logo className="h-8 w-auto" />
              <p className="mt-4 max-w-xs text-sm text-ink-muted">{dict.footer.tagline}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                {dict.footer.contact}
              </p>
              <a
                href="mailto:hello@knxclub.jo"
                className="mt-3 inline-block text-base font-medium text-ink hover:text-knx-700"
                dir="ltr"
              >
                hello@knxclub.jo
              </a>
              <p className="mt-1 text-sm text-ink-muted" dir="ltr">
                Amman, Jordan
              </p>
            </div>
            <div className="md:text-end">
              <p className="text-sm text-ink-muted">
                © {new Date().getFullYear()} KNX Club Jordan. {dict.footer.rights}
              </p>
            </div>
          </div>
        </footer>
      }
    />
  );
}
