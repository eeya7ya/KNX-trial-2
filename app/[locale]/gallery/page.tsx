import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getPublicContent } from "@/lib/db";
import { youtubeId, isVideoFileUrl } from "@/lib/media";
import { DetailPageShell } from "../components/DetailPageShell";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);
  const { pictures, videos } = await getPublicContent();
  const t = dict.gallerySection;
  const isEmpty = pictures.length === 0 && videos.length === 0;

  return (
    <DetailPageShell dict={dict} locale={L}>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {t.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{t.body}</p>

      {isEmpty && (
        <p className="mt-12 rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-muted">
          {t.empty}
        </p>
      )}

      {pictures.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {t.pictures}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pictures.map((p) => (
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
                  <div className="p-4">
                    <p className="text-sm font-semibold">{p.title}</p>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{p.description}</p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {videos.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {t.videos}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => {
              const yt = youtubeId(v.url);
              const thumb = yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null;
              const isFile = isVideoFileUrl(v.url);
              return (
                <li key={v.id}>
                  <div className="overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="relative aspect-video bg-neutral-100">
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
                        thumb && (
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 grid place-items-center"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt={v.title}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          </a>
                        )
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold">{v.title}</p>
                      {v.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
                          {v.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </DetailPageShell>
  );
}
