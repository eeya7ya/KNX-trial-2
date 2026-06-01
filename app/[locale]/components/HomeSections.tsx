"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Header } from "./Header";
import { Logo } from "./Logo";
import { JoinForm } from "./JoinForm";
import { Stats } from "./Stats";
import { IconArrow, IconBolt, IconUsers, IconBuilding, IconBook } from "./Icons";

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook];
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
        className="knx-snap-page snap-start relative flex w-full !flex-col px-4 pb-20 pt-[var(--knx-header-h)] md:pb-28"
      >
        <div className="flex w-full flex-1 items-center">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-6 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7 rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-knx" />
                {dict.hero.eyebrow}
              </span>
              <h1 className="mt-4 text-[2.1rem] font-extrabold leading-[1.15] tracking-tight md:text-[3.25rem] md:leading-[1.08] lg:text-[3.75rem]">
                <span className="block">{dict.hero.titleA}</span>
                <span className="mt-1 block text-knx-700">{dict.hero.titleAccent}</span>
                <span className="mt-1 block">{dict.hero.titleB}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:mt-6 md:text-lg">
                {dict.hero.body}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#join"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-knx-700"
                >
                  {dict.hero.primaryCta}
                  <IconArrow
                    className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    dir={dict.dir}
                  />
                </a>
                <Link
                  href={`/${locale}/about`}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
                >
                  {dict.hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center md:max-w-md lg:max-w-lg">
                <Logo className="h-44 w-auto drop-shadow-[0_18px_40px_rgba(0,150,94,0.18)] md:h-56 lg:h-64" />
              </div>
            </div>
          </div>
        </div>

        <Stats items={dict.stats} className="mt-6 md:mt-8" />
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
          <div className="mt-8 grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.services.items.slice(0, 4).map((it, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <div
                  key={it.title}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 text-start transition hover:border-knx hover:shadow-sm"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-knx-50 text-knx-700">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-ink">{it.title}</p>
                  <p className="text-xs leading-relaxed text-ink-muted">{it.body}</p>
                </div>
              );
            })}
          </div>
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
          {content && content.team.length > 0 && (
            <ul className="mt-6 grid w-full max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {content.team.slice(0, 20).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2 rounded-xl border border-line bg-white p-2 text-start"
                >
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      className="h-9 w-9 flex-shrink-0 rounded-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <Avatar name={m.name} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink">{m.name}</p>
                    {m.role && (
                      <p className="truncate text-[10px] text-ink-muted">{m.role}</p>
                    )}
                  </div>
                </li>
              ))}
              {content.team.length > 20 && (
                <li>
                  <Link
                    href={`/${locale}/members`}
                    className="flex h-full items-center justify-center rounded-xl border border-dashed border-line bg-white p-2 text-sm font-semibold text-knx-700 transition hover:border-knx"
                  >
                    +{content.team.length - 20}
                  </Link>
                </li>
              )}
            </ul>
          )}
        </BriefCard>
      </Section>

      {/* LATEST NEWS — single item, half text / half media */}
      {content && content.latestNews && (
        <Section id="updates">
          <LatestNewsSection
            item={content.latestNews}
            dict={dict}
            locale={locale}
          />
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
              href="mailto:hello@support.knx-jordan-club.com"
              className="mt-8 inline-block text-2xl font-semibold text-ink hover:text-knx-700 md:text-3xl"
              dir="ltr"
            >
              hello@support.knx-jordan-club.com
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

function LatestNewsSection({
  item,
  dict,
  locale,
}: {
  item: NonNullable<PublicContent["latestNews"]>;
  dict: Dict;
  locale: Locale;
}) {
  const t = dict.newsSection;
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

      <article className="mt-10 grid items-stretch gap-0 overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:grid-cols-2">
        <div className="flex flex-col justify-center p-6 md:p-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {new Date(item.event_date ?? item.created_at).toLocaleDateString(
              locale === "ar" ? "ar-JO" : "en-GB",
              { year: "numeric", month: "long", day: "numeric" },
            )}
          </span>
          <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            {item.title}
          </h3>
          <p className="mt-4 line-clamp-6 text-base text-ink-muted md:text-lg">
            {item.body}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/news/${item.id}`}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-knx-700"
            >
              {t.readMore}
              <IconArrow
                className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                dir={dict.dir}
              />
            </Link>
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              {t.seeAll}
            </Link>
          </div>
        </div>
        <div className="relative min-h-[260px] bg-neutral-100 md:min-h-[420px]">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-muted">
              <Logo className="h-20 w-auto opacity-60" />
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

