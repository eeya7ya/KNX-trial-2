import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isAr = locale === "ar";
  return {
    title: isAr ? "نادي KNX الأردني" : "KNX Club Jordan",
    description: isAr
      ? "النادي المهني الأردني لمعيار KNX — مجتمع للمكاملين والمهندسين والمعماريين."
      : "The Jordanian KNX Club — a community for KNX professionals, integrators, and architects.",
    icons: { icon: "/knx-logo.svg" },
  };
}

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale as Locale);

  return (
    <html
      lang={dict.htmlLang}
      dir={dict.dir}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body className="bg-white text-ink">{children}</body>
    </html>
  );
}
