import Link from "next/link";
import {
  IconArrow,
  IconBolt,
  IconUsers,
  IconShield,
  IconBook,
  IconBuilding,
  IconBadge,
  IconCalendar,
  IconCheck,
  IconClock,
  IconPin,
} from "./Icons";
import type { Dict, Locale } from "@/lib/i18n";
import type { TeamMemberItem } from "@/lib/db";
import type { EventCard } from "@/lib/events";
import { MembersDirectory } from "./MembersDirectory";

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook, IconShield, IconBadge];

export function AboutDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        {dict.about.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.about.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.about.body}</p>
      <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
        {dict.about.pillars.map((p) => (
          <li key={p.title} className="bg-card p-6">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <IconCheck className="h-4 w-4" />
            </div>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{p.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicesDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        {dict.services.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.services.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.services.brief}</p>
      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2">
        {dict.services.items.map((item, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
          return (
            <div key={item.title} className="bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cta text-cta-ink">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EventsDetail({
  dict,
  locale,
  events,
}: {
  dict: Dict;
  locale: Locale;
  events: EventCard[];
}) {
  const t = dict.events;
  const upcoming = events.filter((e) => e.status !== "past");
  // Most recent first: the workshop that just happened is the one people look for.
  const past = events.filter((e) => e.status === "past").reverse();
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        {t.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{t.body}</p>
      <Link
        href={`/${locale}#join`}
        className="group mt-6 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-cta-ink transition hover:bg-cta-hover"
      >
        {t.notify}
        <IconArrow
          className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          dir={dict.dir}
        />
      </Link>

      <h2 className="mt-12 text-xs font-semibold uppercase tracking-widest text-accent">
        {t.upcoming}
      </h2>
      {upcoming.length > 0 ? (
        <ol className="mt-4 grid gap-4">
          {upcoming.map((e) => (
            <EventRow key={e.id} event={e} dict={dict} />
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-card px-6 py-8 text-center text-sm text-ink-muted">
          {t.empty}
        </p>
      )}
      <p className="mt-4 text-sm text-ink-muted">{t.more}</p>

      {past.length > 0 && (
        <>
          <h2 className="mt-12 text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {t.past}
          </h2>
          <ol className="mt-4 grid gap-3">
            {past.map((e) => (
              <EventRow key={e.id} event={e} dict={dict} />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

/* Event text is whatever the admin typed — on the posters so far, English.
   <bdi> keeps it reading the right way round inside the Arabic page, where a
   trailing full stop would otherwise jump to the start of the sentence. */
function EventRow({ event: e, dict }: { event: EventCard; dict: Dict }) {
  const t = dict.events;
  const past = e.status === "past";
  return (
    <li
      className={`flex gap-4 rounded-2xl border bg-card p-4 md:gap-6 md:p-6 ${
        e.status === "today" ? "border-knx" : "border-line"
      }`}
    >
      <div
        aria-hidden="true"
        className={`flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl text-center md:h-20 md:w-20 ${
          past ? "bg-subtle text-ink-muted" : "bg-accent-soft text-accent"
        }`}
      >
        <span className="text-2xl font-extrabold leading-none md:text-3xl">{e.day}</span>
        <span className="mt-1 text-[11px] font-semibold leading-tight">{e.month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t.kinds[e.kind] ?? t.kinds.workshop}
          </span>
          {e.status === "today" && (
            <span className="rounded-full bg-knx px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {t.today}
            </span>
          )}
          {past && (
            <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
              {t.completed}
            </span>
          )}
        </div>
        <h3 className={`mt-1 font-bold leading-snug ${past ? "text-base" : "text-lg md:text-xl"}`}>
          <bdi>{e.title}</bdi>
        </h3>
        {e.subtitle && (
          <p className="mt-1 text-sm text-ink-muted">
            <bdi>{e.subtitle}</bdi>
          </p>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4 text-accent" />
            {e.dateLabel}
          </span>
          {e.timeLabel && (
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="h-4 w-4 text-accent" />
              {e.timeLabel}
            </span>
          )}
          {e.location && (
            <span className="inline-flex items-center gap-1.5">
              <IconPin className="h-4 w-4 text-accent" />
              <bdi>{e.location}</bdi>
            </span>
          )}
        </p>

        {e.presenter_name && (
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-center gap-3">
              {e.presenter_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.presenter_photo_url}
                  alt={e.presenter_name}
                  loading="lazy"
                  className={`h-12 w-12 flex-shrink-0 rounded-full object-cover object-top md:hidden ${
                    past ? "grayscale" : ""
                  }`}
                />
              ) : (
                <span className="md:hidden">
                  <Avatar name={e.presenter_name} size="lg" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  {t.presenter}
                </p>
                <p className="text-sm font-semibold">
                  <bdi>{e.presenter_name}</bdi>
                </p>
                {e.presenter_role && (
                  <p className="text-sm text-ink-muted">
                    <bdi>{e.presenter_role}</bdi>
                  </p>
                )}
              </div>
            </div>
            {e.presenter_bio && !past && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                <bdi>{e.presenter_bio}</bdi>
              </p>
            )}
          </div>
        )}

        {e.register_url && !past && (
          <a
            href={e.register_url}
            target={e.register_url.startsWith("/") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-cta-ink transition hover:bg-cta-hover"
          >
            {t.register}
            <IconArrow className="h-4 w-4" dir={dict.dir} />
          </a>
        )}
      </div>

      {e.presenter_photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={e.presenter_photo_url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`hidden flex-shrink-0 self-start rounded-xl object-cover object-top md:block ${
            past ? "w-24 grayscale" : "w-32"
          } aspect-[4/5]`}
        />
      )}
    </li>
  );
}

export function MembersDetail({
  dict,
  team,
}: {
  dict: Dict;
  team: TeamMemberItem[];
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        {dict.members.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.members.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.members.brief}</p>

      <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-accent">
        {dict.members.boardLabel}
      </p>

      <MembersDirectory dict={dict} team={team} />
    </div>
  );
}

export function FaqDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        {dict.faq.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.faq.title}</h1>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        {dict.faq.items.map((item) => (
          <details key={item.q} className="group py-5">
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

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name
    .replace(/^(م\.|د\.|أ\.|Eng\.|Dr\.|Mr\.|Ms\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
  const dim = size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`grid ${dim} flex-shrink-0 place-items-center rounded-full bg-accent-soft font-bold text-accent`}
    >
      {initials || "·"}
    </span>
  );
}
