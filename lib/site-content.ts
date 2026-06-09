import { ensureSchema, sql } from "./db";
import { getDict, locales, type Dict, type Locale } from "./i18n";

/**
 * Editable homepage content. These sections default to the static i18n
 * dictionary but can be overridden per-locale from the admin panel
 * (stored in the `site_settings` table).
 */

export type StatEntry = { value: string; label: string };
export type AboutEntry = { title: string; body: string };
export type ServiceEntry = { title: string; body: string };
export type FaqEntry = { q: string; a: string };

export type LocalizedStats = Record<Locale, StatEntry[]>;
export type LocalizedAbout = Record<Locale, AboutEntry>;
export type LocalizedServices = Record<Locale, ServiceEntry[]>;
export type LocalizedFaq = Record<Locale, FaqEntry[]>;

export type SiteSettings = {
  stats?: LocalizedStats;
  about?: LocalizedAbout;
  services?: LocalizedServices;
  faq?: LocalizedFaq;
};

export const SITE_SETTING_KEYS = ["stats", "about", "services", "faq"] as const;
export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export function isSiteSettingKey(value: string): value is SiteSettingKey {
  return (SITE_SETTING_KEYS as readonly string[]).includes(value);
}

/** Load all stored overrides. Returns an empty object on any failure. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await ensureSchema();
    const rows = (await sql`SELECT key, value FROM site_settings`) as {
      key: string;
      value: unknown;
    }[];
    const out: SiteSettings = {};
    for (const r of rows) {
      if (r.key === "stats") out.stats = r.value as LocalizedStats;
      else if (r.key === "about") out.about = r.value as LocalizedAbout;
      else if (r.key === "services") out.services = r.value as LocalizedServices;
      else if (r.key === "faq") out.faq = r.value as LocalizedFaq;
    }
    return out;
  } catch (err) {
    console.error("getSiteSettings error", err);
    return {};
  }
}

/** Merge stored overrides for a locale on top of the static dictionary. */
export function applySiteSettings(
  dict: Dict,
  locale: Locale,
  settings: SiteSettings,
): Dict {
  const stats = settings.stats?.[locale];
  const about = settings.about?.[locale];
  const services = settings.services?.[locale];
  const faq = settings.faq?.[locale];
  return {
    ...dict,
    stats: stats && stats.length ? stats : dict.stats,
    about: about
      ? {
          ...dict.about,
          title: about.title?.trim() || dict.about.title,
          body: about.body?.trim() || dict.about.body,
        }
      : dict.about,
    services:
      services && services.length
        ? { ...dict.services, items: services }
        : dict.services,
    faq: faq && faq.length ? { ...dict.faq, items: faq } : dict.faq,
  };
}

/** Dictionary for a locale with admin overrides applied. */
export async function getSiteDict(locale: Locale): Promise<Dict> {
  const settings = await getSiteSettings();
  return applySiteSettings(getDict(locale), locale, settings);
}

/**
 * Current editable content for every locale, with overrides applied — the
 * shape the admin editor is initialised from.
 */
export async function getEditableContent(): Promise<{
  stats: LocalizedStats;
  about: LocalizedAbout;
  services: LocalizedServices;
  faq: LocalizedFaq;
}> {
  const settings = await getSiteSettings();
  const stats = {} as LocalizedStats;
  const about = {} as LocalizedAbout;
  const services = {} as LocalizedServices;
  const faq = {} as LocalizedFaq;
  for (const locale of locales) {
    const dict = applySiteSettings(getDict(locale), locale, settings);
    stats[locale] = dict.stats.map((s) => ({ value: s.value, label: s.label }));
    about[locale] = { title: dict.about.title, body: dict.about.body };
    services[locale] = dict.services.items.map((s) => ({
      title: s.title,
      body: s.body,
    }));
    faq[locale] = dict.faq.items.map((f) => ({ q: f.q, a: f.a }));
  }
  return { stats, about, services, faq };
}
