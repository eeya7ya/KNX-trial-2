import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getNewsDetail } from "@/lib/db";
import { youtubeId, isVideoFileUrl } from "@/lib/media";
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
  const item = await getNewsDetail(numId);
  if (!item) notFound();
  const t = dict.newsSection;
  const g = dict.gallerySection;
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
          {new Date(item.event_date ?? item.created_at).toLocaleDateString(dateLocale, {
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

        {item.pictures.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-knx-700">
              {g.pictures}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {item.pictures.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    <div className="relative aspect-[4/3] bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-contain transition group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {item.videos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-knx-700">
              {g.videos}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {item.videos.map((v) => {
                const yt = youtubeId(v.url);
                const isFile = isVideoFileUrl(v.url);
                return (
                  <li key={v.id}>
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-neutral-100">
                      {yt ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${yt}`}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                        />
                      ) : isFile ? (
                        <video
                          src={v.url}
                          controls
                          preload="metadata"
                          className="absolute inset-0 h-full w-full bg-black object-contain"
                        />
                      ) : (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 grid place-items-center text-sm text-knx-700"
                        >
                          {v.title}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </article>
    </DetailPageShell>
  );
}
