import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getGallery, type GalleryFolder } from "@/lib/db";
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
  const folders = await getGallery();
  const t = dict.gallerySection;
  const dateLocale = L === "ar" ? "ar-JO" : "en-GB";
  const generalLabel = L === "ar" ? "عام" : "General";

  return (
    <DetailPageShell dict={dict} locale={L}>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {t.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{t.body}</p>

      {folders.length === 0 && (
        <p className="mt-12 rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-muted">
          {t.empty}
        </p>
      )}

      <div className="mt-10 space-y-14">
        {folders.map((folder) => (
          <GalleryFolderSection
            key={folder.key}
            folder={folder}
            title={folder.title || generalLabel}
            dateLocale={dateLocale}
            t={t}
          />
        ))}
      </div>
    </DetailPageShell>
  );
}

function GalleryFolderSection({
  folder,
  title,
  dateLocale,
  t,
}: {
  folder: GalleryFolder;
  title: string;
  dateLocale: string;
  t: { pictures: string; videos: string };
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
        {folder.date && (
          <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {new Date(folder.date).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {folder.pictures.length > 0 && (
        <>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {t.pictures}
          </h3>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folder.pictures.map((p) => (
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
                  {p.title && (
                    <div className="p-4">
                      <p className="text-sm font-semibold">{p.title}</p>
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {folder.videos.length > 0 && (
        <>
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {t.videos}
          </h3>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folder.videos.map((v) => {
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
                    {v.title && (
                      <div className="p-4">
                        <p className="text-sm font-semibold">{v.title}</p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
