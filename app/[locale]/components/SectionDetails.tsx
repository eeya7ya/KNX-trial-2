import {
  IconBolt,
  IconUsers,
  IconShield,
  IconBook,
  IconBuilding,
  IconBadge,
  IconCheck,
} from "./Icons";
import type { Dict } from "@/lib/i18n";
import type { TeamMemberItem } from "@/lib/db";

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook, IconShield, IconBadge];

export function AboutDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.about.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.about.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.about.body}</p>
      <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
        {dict.about.pillars.map((p) => (
          <li key={p.title} className="bg-white p-6">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-knx-50 text-knx-700">
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
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.services.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.services.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.services.brief}</p>
      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2">
        {dict.services.items.map((item, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
          return (
            <div key={item.title} className="bg-white p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
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

export function EventsDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.events.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.events.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.events.body}</p>
      <ul className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
        {dict.events.rows.map((row, i) => (
          <li
            key={row.title}
            className={`flex flex-wrap items-center justify-between gap-3 px-6 py-5 transition hover:bg-neutral-50 ${
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

export function MembersDetail({
  dict,
  team,
}: {
  dict: Dict;
  team: TeamMemberItem[];
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.members.eyebrow}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{dict.members.title}</h1>
      <p className="mt-4 max-w-3xl text-base text-ink-muted md:text-lg">{dict.members.brief}</p>

      <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-knx-700">
        {dict.members.boardLabel}
      </p>

      {team.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-muted">
          —
        </p>
      ) : (
        <ul className="mt-4 grid gap-4">
          {team.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-white p-5 md:p-6"
            >
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
                  loading="lazy"
                />
              ) : (
                <Avatar name={m.name} size="lg" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-ink">{m.name}</p>
                {m.role && <p className="mt-1 text-sm text-ink-muted">{m.role}</p>}
                {m.company && (
                  <p className="mt-1 text-xs text-ink-muted">{m.company}</p>
                )}
              </div>
              {m.is_partner && (
                <div className="flex items-center gap-2 rounded-full border border-line bg-knx-50 px-3 py-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/KNX_logo.svg.png"
                    alt="KNX partner"
                    className="h-6 w-auto"
                  />
                  <span className="text-xs font-semibold text-knx-700">
                    {dict.membersSection.partnerLabel}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FaqDetail({ dict }: { dict: Dict }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
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
      className={`grid ${dim} flex-shrink-0 place-items-center rounded-full bg-knx-50 font-bold text-knx-700`}
    >
      {initials || "·"}
    </span>
  );
}
