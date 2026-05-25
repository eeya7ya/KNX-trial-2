import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { headers } from "next/headers";
import "../globals.css";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://knxclub.jo"
).replace(/\/$/, "");

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

  const reqPath = (await headers()).get("x-knx-path") ?? `/${locale}`;
  const route = reqPath.replace(/^\/(ar|en)(?=\/|$)/, "");
  const canonical = `${SITE_URL}/${locale}${route}`;

  const title = isAr
    ? "نادي KNX الأردني | KNX Club Jordan"
    : "KNX Club Jordan — The Jordanian KNX Community";
  const description = isAr
    ? "نادي KNX الأردني (KNX Club Jordan) — المجتمع المهني الأردني لمعيار KNX لأتمتة المباني والمنازل الذكية، يجمع المكاملين والمهندسين والمعماريين في الأردن."
    : "KNX Club Jordan — the professional community for the KNX building & home automation standard in Jordan, bringing together integrators, engineers, and architects.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: isAr ? "%s | نادي KNX الأردني" : "%s | KNX Club Jordan",
    },
    description,
    applicationName: "KNX Club Jordan",
    keywords: [
      "KNX Club Jordan",
      "KNX Jordan Club",
      "KNX Jordan",
      "KNX Club",
      "KNX Amman",
      "KNX Jordan community",
      "building automation Jordan",
      "smart home Jordan",
      "smart buildings Jordan",
      "ETS6 training Jordan",
      "نادي KNX الأردني",
      "نادي KNX الأردن",
      "KNX الأردن",
      "أتمتة المباني الأردن",
      "المنازل الذكية الأردن",
    ],
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar${route}`,
        en: `${SITE_URL}/en${route}`,
        "x-default": `${SITE_URL}/ar${route}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "KNX Club Jordan",
      title,
      description,
      url: canonical,
      locale: isAr ? "ar_JO" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_JO",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: { icon: "/KNX_logo.svg.png" },
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
  const isAr = locale === "ar";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KNX Club Jordan",
    alternateName: ["نادي KNX الأردني", "KNX Jordan Club", "KNX Jordan"],
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/KNX_logo.svg.png`,
    description: isAr
      ? "المجتمع المهني الأردني لمعيار KNX لأتمتة المباني والمنازل الذكية."
      : "The professional Jordanian community for the KNX building and home automation standard.",
    areaServed: { "@type": "Country", name: "Jordan" },
    knowsLanguage: ["ar", "en"],
  };

  return (
    <html
      lang={dict.htmlLang}
      dir={dict.dir}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body className="bg-white text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
