import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getNewsById } from "@/lib/db";
import { DetailPageShell } from "../../components/DetailPageShell";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();
  const item = await getNewsById(numId);
  if (!item) notFound();
  const t = dict.newsSection;
  const dateLocale = L === "ar" ? "ar-JO" : "en-GB";

  return (
    <DetailPageShell dict={dict} locale={L}>
      <Link
        href={`/${L}/news`}
        className="text-sm font-semibold text-knx-700 transition hover:text-knx-800"
      >
        ← {t.backToList}
      </Link>
      <article className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-knx-700">
          {new Date(item.created_at).toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {item.title}
        </h1>
        {item.image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}
        <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-ink md:text-lg">
          {item.body}
        </div>
      </article>
    </DetailPageShell>
  );
}
