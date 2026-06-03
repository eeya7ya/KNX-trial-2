import {
  IconBolt,
  IconUsers,
  IconShield,
  IconBook,
  IconBuilding,
  IconBadge,
  IconCheck,
} from "./Icons";
import type { ReactNode } from "react";
import type { Dict } from "@/lib/i18n";
import type { TeamMemberItem } from "@/lib/db";
import { MembersDirectory } from "./MembersDirectory";

const SERVICE_ICONS = [IconBolt, IconUsers, IconBuilding, IconBook, IconShield, IconBadge];

export function AboutDetail({
  dict,
  globe,
}: {
  dict: Dict;
  globe?: ReactNode;
}) {
  return (
    <div>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Text — left-hand side */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-knx-700">
            {dict.about.eyebrow}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {dict.about.title}
          </h1>
          <p className="mt-4 text-base text-ink-muted md:text-lg">{dict.about.body}</p>
        </div>
        {/* 3D Earth — right-hand side */}
        {globe && (
          <div className="flex justify-center lg:justify-end">{globe}</div>
        )}
      </div>
      <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
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

      <MembersDirectory dict={dict} team={team} />
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
