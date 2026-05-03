"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { JoinForm } from "./JoinForm";
import { Stats } from "./Stats";
import {
  IconBolt,
  IconUsers,
  IconShield,
  IconBook,
  IconBuilding,
  IconBadge,
  IconArrow,
  IconCheck,
} from "./Icons";
import type { Dict, Locale } from "@/lib/i18n";
import type { PublicContent } from "@/lib/db";

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook, IconShield, IconBadge];

type DetailKey = "about" | "services" | "events" | "faq";

export function HomeSections({
  dict,
  locale,
  header,
  footer,
  content,
}: {
  dict: Dict;
  locale: Locale;
  header: ReactNode;
  footer: ReactNode;
  content?: PublicContent;
}) {
  const [open, setOpen] = useState<DetailKey | null>(null);
  const openRef = useRef<DetailKey | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Solid full-page snap: one wheel/swipe → exactly one section, with locked animation window.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pages = Array.from(
      root.querySelectorAll<HTMLElement>(".knx-snap-page"),
    );
    if (pages.length === 0) return;

    let activeIndex = 0;
    let locked = false;
    let unlockTimer: ReturnType<typeof setTimeout> | null = null;

    function setActive(i: number) {
      if (i === activeIndex) return;
      pages[activeIndex]?.classList.remove("knx-page-active");
      pages[i]?.classList.add("knx-page-active");
      activeIndex = i;
    }

    pages[0].classList.add("knx-page-active");

    const io = new IntersectionObserver(
      (entries) => {
        let best: { i: number; ratio: number } | null = null;
        for (const e of entries) {
          const i = pages.indexOf(e.target as HTMLElement);
          if (i < 0) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { i, ratio: e.intersectionRatio };
          }
        }
        if (best && best.ratio > 0.5) setActive(best.i);
      },
      { root, threshold: [0.5] },
    );
    pages.forEach((p) => io.observe(p));

    function lock(ms: number) {
      locked = true;
      if (unlockTimer) clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => {
        locked = false;
      }, ms);
    }

    function goTo(i: number) {
      const target = Math.max(0, Math.min(pages.length - 1, i));
      if (target === activeIndex) return;
      pages[target].scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(target);
      lock(800);
    }

    function onWheel(e: WheelEvent) {
      if (openRef.current) return;
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (locked) return;
      goTo(activeIndex + (e.deltaY > 0 ? 1 : -1));
    }

    function onKey(e: KeyboardEvent) {
      if (openRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        if (!locked) goTo(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (!locked) goTo(activeIndex - 1);
      }
    }

    let touchStartY: number | null = null;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0]?.clientY ?? null;
    }
    function onTouchEnd(e: TouchEvent) {
      if (touchStartY == null || locked || openRef.current) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY;
      const dy = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(dy) < 40) return;
      goTo(activeIndex + (dy > 0 ? 1 : -1));
    }

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      io.disconnect();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      if (unlockTimer) clearTimeout(unlockTimer);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Mark visit once per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("knx-tracked")) return;
    sessionStorage.setItem("knx-tracked", "1");
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [locale]);

  return (
    <div ref={rootRef} className="knx-snap-root knx-animated-bg">
      {header}

      {/* HERO — page 1 */}
      <section
        id="hero"
        className="knx-snap-page snap-start relative flex w-full !flex-col px-4 pb-4 pt-[var(--knx-header-h)] md:pb-6"
      >
        <div className="flex w-full flex-1 items-center">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-4 px-6 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7 rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-knx" />
                {dict.hero.eyebrow}
              </span>
              <h1 className="mt-3 text-[1.9rem] font-extrabold leading-[1.15] tracking-tight md:text-[3rem] md:leading-[1.1]">
                <span className="block">{dict.hero.titleA}</span>
                <span className="mt-1 block text-knx-700 md:mt-1.5">{dict.hero.titleAccent}</span>
                <span className="mt-1 block md:mt-1.5">{dict.hero.titleB}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:mt-4 md:text-base">
                {dict.hero.body}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href="#join"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-700 md:py-3"
                >
                  {dict.hero.primaryCta}
                  <IconArrow
                    className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    dir={dict.dir}
                  />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-ink md:py-3"
                >
                  {dict.hero.secondaryCta}
                </a>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center md:max-w-lg">
                <Logo className="h-36 w-auto drop-shadow-[0_18px_40px_rgba(0,150,94,0.18)] md:h-56 lg:h-64" />
              </div>
            </div>
          </div>
        </div>

        <Stats items={dict.stats} className="mt-4 md:mt-6" />
      </section>

      {/* ABOUT — brief */}
      <Section id="about">
        <BriefCard
          eyebrow={dict.about.eyebrow}
          title={dict.about.title}
          body={dict.about.body}
          cta={dict.detailCta}
          onClick={() => setOpen("about")}
          dir={dict.dir}
        />
      </Section>

      {/* SERVICES — brief */}
      <Section id="services">
        <BriefCard
          eyebrow={dict.services.eyebrow}
          title={dict.services.title}
          body={dict.services.brief}
          cta={dict.detailCta}
          onClick={() => setOpen("services")}
          dir={dict.dir}
        >
          <ul className="mt-6 grid w-full max-w-3xl grid-cols-2 gap-2 text-sm md:grid-cols-3">
            {dict.services.items.slice(0, 6).map((it) => (
              <li
                key={it.title}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-center text-ink-muted"
              >
                {it.title}
              </li>
            ))}
          </ul>
        </BriefCard>
      </Section>

      {/* EVENTS — brief */}
      <Section id="events">
        <BriefCard
          eyebrow={dict.events.eyebrow}
          title={dict.events.title}
          body={dict.events.body}
          cta={dict.detailCta}
          onClick={() => setOpen("events")}
          dir={dict.dir}
        />
      </Section>

      {/* UPDATES — admin-uploaded content from DB */}
      {content && hasContent(content) && (
        <Section id="updates">
          <UpdatesSection content={content} dict={dict} />
        </Section>
      )}

      {/* JOIN — full action */}
      <Section id="join" className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-knx-200">
              {dict.join.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {dict.join.title}
            </h2>
            <p className="mt-5 max-w-md text-neutral-300">{dict.join.body}</p>
          </div>
          <div className="md:col-span-7">
            <div className="rounded-2xl bg-white p-6 text-ink shadow-2xl md:p-8">
              <JoinForm dict={dict} locale={locale} />
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ — brief */}
      <Section id="faq">
        <BriefCard
          eyebrow={dict.faq.eyebrow}
          title={dict.faq.title}
          body={dict.faq.brief}
          cta={dict.detailCta}
          onClick={() => setOpen("faq")}
          dir={dict.dir}
        />
      </Section>

      {/* CONTACT — hero on top, footer pinned to bottom */}
      <section
        id="contact-page"
        className="knx-snap-page snap-start !flex-col border-t border-line bg-white"
      >
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-knx-700">
              <span className="h-px w-8 bg-knx-700" />
              {dict.footer.contact}
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {dict.footer.tagline}
            </h2>
            <a
              href="mailto:hello@knxclub.jo"
              className="mt-8 inline-block text-2xl font-semibold text-ink hover:text-knx-700 md:text-3xl"
              dir="ltr"
            >
              hello@knxclub.jo
            </a>
            <p className="mt-3 text-sm text-ink-muted" dir="ltr">
              Amman, Jordan
            </p>
          </div>
        </div>
        <div className="w-full border-t border-line">{footer}</div>
      </section>

      {open && (
        <DetailModal onClose={() => setOpen(null)} closeLabel={dict.close}>
          {open === "about" && <AboutDetail dict={dict} />}
          {open === "services" && <ServicesDetail dict={dict} />}
          {open === "events" && <EventsDetail dict={dict} />}
          {open === "faq" && <FaqDetail dict={dict} />}
        </DetailModal>
      )}
    </div>
  );
}

function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`knx-snap-page snap-start relative flex w-full items-center justify-center px-4 py-16 ${className}`}
    >
      <div className="w-full">{children}</div>
    </section>
  );
}

function BriefCard({
  eyebrow,
  title,
  body,
  cta,
  onClick,
  dir,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  dir: "rtl" | "ltr";
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-knx-700">
        <span className="h-px w-8 bg-knx-700" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-5 max-w-2xl text-base text-ink-muted md:text-lg">{body}</p>
      {children}
      <button
        type="button"
        onClick={onClick}
        className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-knx-700"
      >
        {cta}
        <IconArrow
          className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          dir={dir}
        />
      </button>
    </div>
  );
}

function DetailModal({
  children,
  onClose,
  closeLabel,
}: {
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-10">
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:border-ink hover:text-ink"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function AboutDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.about.eyebrow}
      </span>
      <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{dict.about.title}</h3>
      <p className="mt-4 text-ink-muted">{dict.about.body}</p>
      <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
        {dict.about.pillars.map((p) => (
          <li key={p.title} className="bg-white p-5">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-knx-50 text-knx-700">
              <IconCheck className="h-4 w-4" />
            </div>
            <h4 className="font-semibold">{p.title}</h4>
            <p className="mt-2 text-sm text-ink-muted">{p.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicesDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.services.eyebrow}
      </span>
      <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{dict.services.title}</h3>
      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2">
        {dict.services.items.map((item, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
          return (
            <div key={item.title} className="bg-white p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventsDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.events.eyebrow}
      </span>
      <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{dict.events.title}</h3>
      <p className="mt-4 text-ink-muted">{dict.events.body}</p>
      <ul className="mt-6 overflow-hidden rounded-2xl border border-line">
        {dict.events.rows.map((row, i) => (
          <li
            key={row.title}
            className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-neutral-50 ${
              i !== 0 ? "border-t border-line" : ""
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">{row.tag}</span>
              <span className="mt-1 text-base font-semibold">{row.title}</span>
              <span className="mt-1 text-sm text-ink-muted">{row.meta}</span>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted">
              {dict.events.soon}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.faq.eyebrow}
      </span>
      <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{dict.faq.title}</h3>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        {dict.faq.items.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <dt className="text-base font-semibold">{item.q}</dt>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink-muted transition group-open:rotate-45 group-open:border-ink group-open:text-ink">
                +
              </span>
            </summary>
            <dd className="mt-3 text-sm text-ink-muted">{item.a}</dd>
          </details>
        ))}
      </dl>
    </div>
  );
}

function hasContent(c: PublicContent) {
  return c.news.length + c.videos.length + c.pictures.length > 0;
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || u.pathname.split("/").pop() || null;
    }
    return null;
  } catch {
    return null;
  }
}

function UpdatesSection({ content, dict }: { content: PublicContent; dict: Dict }) {
  const isAr = dict.dir === "rtl";
  const t = {
    eyebrow: isAr ? "آخر التحديثات" : "Latest updates",
    title: isAr ? "أحدث ما لدينا" : "Fresh from the club",
    body: isAr
      ? "أخبار وفعاليات وموارد جديدة يضيفها الفريق."
      : "News, media, and resources added by the team.",
    news: isAr ? "أخبار" : "News",
    videos: isAr ? "فيديوهات" : "Videos",
    pictures: isAr ? "صور" : "Pictures",
    watch: isAr ? "شاهد" : "Watch",
    open: isAr ? "افتح" : "Open",
  };
  return (
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-knx-700">
          <span className="h-px w-8 bg-knx-700" />
          {t.eyebrow}
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {t.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted md:text-lg">{t.body}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-knx-700">{t.news}</p>
          {content.news.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">—</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {content.news.slice(0, 4).map((n) => (
                <li key={n.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  {n.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.image_url}
                      alt=""
                      className="mb-2 h-28 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  )}
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {t.videos}
          </p>
          {content.videos.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">—</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {content.videos.slice(0, 4).map((v) => {
                const id = youtubeId(v.url);
                const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
                return (
                  <li key={v.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-sm transition hover:text-knx-700"
                    >
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-14 w-24 flex-shrink-0 rounded-md object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="font-semibold">{v.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {t.pictures}
          </p>
          {content.pictures.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">—</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {content.pictures.slice(0, 4).map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  title={p.title}
                  className="block overflow-hidden rounded-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.title}
                    className="h-24 w-full object-cover transition hover:scale-105"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
