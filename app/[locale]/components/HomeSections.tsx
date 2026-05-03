"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Header } from "./Header";
import { Logo } from "./Logo";
import { JoinForm } from "./JoinForm";
import { Stats } from "./Stats";
import { IconArrow } from "./Icons";
import { Avatar } from "./SectionDetails";
import type { Dict, Locale } from "@/lib/i18n";
import type { PublicContent } from "@/lib/db";

export function HomeSections({
  dict,
  locale,
  footer,
  content,
}: {
  dict: Dict;
  locale: Locale;
  footer: ReactNode;
  content?: PublicContent;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (locked) return;
      goTo(activeIndex + (e.deltaY > 0 ? 1 : -1));
    }

    function onKey(e: KeyboardEvent) {
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
      if (touchStartY == null || locked) return;
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
      <Header dict={dict} locale={locale} />

      {/* HERO — page 1 */}
      <section
        id="hero"
        className="knx-snap-page snap-start relative flex w-full !flex-col px-4 pb-16 pt-[var(--knx-header-h)] md:pb-20"
      >
        <div className="flex w-full flex-1 items-start pt-2 md:pt-4">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-4 px-6 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7 rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-knx" />
                {dict.hero.eyebrow}
              </span>
              <h1 className="mt-3 text-[1.9rem] font-extrabold leading-[1.15] tracking-tight md:text-[2.75rem] md:leading-[1.1] lg:text-[3rem]">
                <span className="block">{dict.hero.titleA}</span>
                <span className="mt-1 block text-knx-700">{dict.hero.titleAccent}</span>
                <span className="mt-1 block">{dict.hero.titleB}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:mt-4 md:text-base">
                {dict.hero.body}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#join"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-700"
                >
                  {dict.hero.primaryCta}
                  <IconArrow
                    className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    dir={dict.dir}
                  />
                </a>
                <Link
                  href={`/${locale}/about`}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
                >
                  {dict.hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative mx-auto grid aspect-square w-full max-w-xs place-items-center md:max-w-sm lg:max-w-md">
                <Logo className="h-36 w-auto drop-shadow-[0_18px_40px_rgba(0,150,94,0.18)] md:h-48 lg:h-56" />
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
          href={`/${locale}/about`}
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
          href={`/${locale}/services`}
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
          href={`/${locale}/events`}
          dir={dict.dir}
        />
      </Section>

      {/* MEMBERS — brief */}
      <Section id="members">
        <BriefCard
          eyebrow={dict.members.eyebrow}
          title={dict.members.title}
          body={dict.members.brief}
          cta={dict.detailCta}
          href={`/${locale}/members`}
          dir={dict.dir}
        >
          <ul className="mt-6 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
            {dict.members.items.slice(0, 3).map((m) => (
              <li
                key={m.name}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-start"
              >
                <Avatar name={m.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                  <p className="truncate text-xs text-ink-muted">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </BriefCard>
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
          href={`/${locale}/faq`}
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
  href,
  dir,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
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
      <Link
        href={href}
        className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-knx-700"
      >
        {cta}
        <IconArrow
          className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          dir={dir}
        />
      </Link>
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
