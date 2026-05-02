import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { Header } from "./components/Header";
import { Logo } from "./components/Logo";
import { JoinForm } from "./components/JoinForm";
import {
  IconBolt,
  IconUsers,
  IconShield,
  IconBook,
  IconBuilding,
  IconBadge,
  IconArrow,
  IconCheck,
} from "./components/Icons";

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook, IconShield, IconBadge];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);

  return (
    <>
      <Header dict={dict} locale={L} />

      <main className="bg-white">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(60% 50% at 90% 0%, rgba(0,150,94,0.10), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgba(0,150,94,0.06), transparent 60%)",
            }}
          />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pt-20 pb-24 md:grid-cols-12 md:pt-28 md:pb-32">
            <div className="md:col-span-7 rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-knx" />
                {dict.hero.eyebrow}
              </span>
              <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight md:text-[4.2rem]">
                {dict.hero.titleA}
                <br />
                <span className="text-knx-700">{dict.hero.titleAccent}</span>
                <br />
                {dict.hero.titleB}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-muted">
                {dict.hero.body}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#join"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-knx-700"
                >
                  {dict.hero.primaryCta}
                  <IconArrow className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" dir={dict.dir} />
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
              <div className="relative mx-auto aspect-square max-w-md">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-knx-50 to-white ring-1 ring-knx-100" />
                <div className="absolute inset-0 grid place-items-center p-12">
                  <Logo className="h-40 w-auto md:h-56" />
                </div>
                <div className="absolute -bottom-4 -end-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-medium text-ink-muted">ISO/IEC 14543-3</p>
                  <p className="text-sm font-semibold">KNX · ETS6 · Secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="border-y border-line bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line px-0 md:grid-cols-4 rtl:divide-x-reverse">
              {dict.stats.map((s) => (
                <div key={s.label} className="px-6 py-8 text-center">
                  <p className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted md:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionEyebrow>{dict.about.eyebrow}</SectionEyebrow>
          <div className="mt-3 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                {dict.about.title}
              </h2>
            </div>
            <div className="md:col-span-7">
              <p className="text-lg leading-relaxed text-ink-muted">{dict.about.body}</p>
              <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
                {dict.about.pillars.map((p) => (
                  <li key={p.title} className="bg-white p-6">
                    <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-knx-50 text-knx-700">
                      <IconCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm text-ink-muted">{p.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="border-t border-line bg-neutral-50/60">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <SectionEyebrow>{dict.services.eyebrow}</SectionEyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {dict.services.title}
            </h2>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2 lg:grid-cols-3">
              {dict.services.items.map((item, i) => {
                const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                return (
                  <div key={item.title} className="group bg-white p-8 transition hover:bg-knx-50/50">
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white transition group-hover:bg-knx-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionEyebrow>{dict.events.eyebrow}</SectionEyebrow>
          <div className="mt-3 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {dict.events.title}
            </h2>
            <p className="max-w-md text-ink-muted">{dict.events.body}</p>
          </div>
          <ul className="mt-12 overflow-hidden rounded-2xl border border-line">
            {dict.events.rows.map((row, i) => (
              <li
                key={row.title}
                className={`flex flex-wrap items-center justify-between gap-4 px-6 py-6 transition hover:bg-neutral-50 ${
                  i !== 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
                    {row.tag}
                  </span>
                  <span className="mt-1 text-lg font-semibold">{row.title}</span>
                  <span className="mt-1 text-sm text-ink-muted">{row.meta}</span>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted">
                  {dict.events.soon}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* JOIN */}
        <section id="join" className="border-t border-line bg-ink text-white">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-12 md:py-32">
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
              <div className="rounded-2xl bg-white p-8 text-ink shadow-2xl md:p-10">
                <JoinForm dict={dict} locale={L} />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 py-24 md:py-32">
          <SectionEyebrow>{dict.faq.eyebrow}</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            {dict.faq.title}
          </h2>
          <dl className="mt-12 divide-y divide-line border-y border-line">
            {dict.faq.items.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <dt className="text-lg font-semibold">{item.q}</dt>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink-muted transition group-open:rotate-45 group-open:border-ink group-open:text-ink">
                    +
                  </span>
                </summary>
                <dd className="mt-3 text-ink-muted">{item.a}</dd>
              </details>
            ))}
          </dl>
        </section>
      </main>

      <footer id="contact" className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
          <div>
            <Logo className="h-8 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">{dict.footer.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {dict.footer.contact}
            </p>
            <a
              href="mailto:hello@knxclub.jo"
              className="mt-3 inline-block text-base font-medium text-ink hover:text-knx-700"
              dir="ltr"
            >
              hello@knxclub.jo
            </a>
            <p className="mt-1 text-sm text-ink-muted" dir="ltr">Amman, Jordan</p>
          </div>
          <div className="md:text-end">
            <p className="text-sm text-ink-muted">
              © {new Date().getFullYear()} KNX Club Jordan. {dict.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-knx-700">
      <span className="h-px w-8 bg-knx-700" />
      {children}
    </span>
  );
}
