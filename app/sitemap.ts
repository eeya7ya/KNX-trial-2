import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getPublicContent } from "@/lib/db";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://knx-jordan-club.com"
).replace(/\/$/, "");

const ROUTES = [
  "",
  "/about",
  "/services",
  "/events",
  "/members",
  "/news",
  "/gallery",
  "/faq",
];

function alternates(route: string) {
  return {
    languages: Object.fromEntries(
      locales.map((l) => [l, `${SITE_URL}/${l}${route}`]),
    ),
  };
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
      alternates: alternates(route),
    })),
  );

  const { news } = await getPublicContent();
  const newsEntries: MetadataRoute.Sitemap = news.flatMap((item) => {
    const route = `/news/${item.id}`;
    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified: new Date(item.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: alternates(route),
    }));
  });

  return [...staticEntries, ...newsEntries];
}
