"use client";

import { useEffect, useState, type ReactNode } from "react";
import { JoinForm } from "./JoinForm";
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

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook, IconShield, IconBadge];

type DetailKey = "about" | "services" | "events" | "faq";

export function HomeSections({
  dict,
  locale,
  header,
  footer,
}: {
  dict: Dict;
  locale: Locale;
  header: ReactNode;
  footer: ReactNode;
}) {
  const [open, setOpen] = useState<DetailKey | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
    <div className="knx-snap-root knx-animated-bg">
      {header}

      {/* HERO — page 1 */}
      <Section id="hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-12">
          <div className="md:col-span-7 rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-knx" />
              {dict.hero.eyebrow}
            </span>
            <h1 className="mt-5 text-[2.2rem] font-extrabold leading-[1.2] tracking-tight md:text-[3.6rem] md:leading-[1.15]">
              <span className="block">{dict.hero.titleA}</span>
              <span className="mt-2 block text-knx-700 md:mt-3">{dict.hero.titleAccent}</span>
              <span className="mt-2 block md:mt-3">{dict.hero.titleB}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              {dict.hero.body}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#join"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-knx-700"
              >
                {dict.hero.primaryCta}
                <IconArrow
                  className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  dir={dict.dir}
                />
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-ink transition hover:border-ink"
              >
                {dict.hero.secondaryCta}
              </a>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-[2rem] ring-1 ring-knx-100">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=70"
                alt="Team collaborating on smart building projects"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-knx-50/80 via-knx-100/40 to-white/10 mix-blend-multiply" />
              <div className="absolute inset-0 bg-knx-700/15" />
              <div className="absolute -bottom-4 -end-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium text-ink-muted">ISO/IEC 14543-3</p>
                <p className="text-sm font-semibold">KNX · ETS6 · Secure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line px-0 md:grid-cols-4">
          {dict.stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-5 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-ink md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-ink-muted md:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

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

      {/* FOOTER pinned in its own snap page */}
      <section className="knx-snap-page snap-start border-t border-line bg-white">
        {footer}
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
