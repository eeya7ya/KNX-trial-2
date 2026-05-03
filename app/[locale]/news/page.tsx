import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getPublicContent } from "@/lib/db";
import { DetailPageShell } from "../components/DetailPageShell";

export const dynamic = "force-dynamic";

export default async function NewsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);
  const { news } = await getPublicContent();
  const t = dict.newsSection;
  const dateLocale = L === "ar" ? "ar-JO" : "en-GB";

  return (
    <DetailPageShell dict={dict} locale={L}>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {t.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{t.body}</p>

      {news.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-muted">
          {t.empty}
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {news.map((n) => (
            <li key={n.id}>
              <Link
                href={`/${L}/news/${n.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-ink"
              >
                <div className="relative aspect-[16/9] bg-neutral-100">
                  {n.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.image_url}
                      alt={n.title}
                      className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-knx-700">
                    {new Date(n.created_at).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-tight">{n.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{n.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DetailPageShell>
  );
}
