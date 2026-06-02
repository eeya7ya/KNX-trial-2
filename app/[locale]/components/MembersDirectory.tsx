"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/lib/i18n";
import type { TeamMemberItem } from "@/lib/db";

export function MembersDirectory({
  dict,
  team,
}: {
  dict: Dict;
  team: TeamMemberItem[];
}) {
  const [selected, setSelected] = useState<TeamMemberItem | null>(null);

  if (team.length === 0) {
    return (
      <p className="mt-3 rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-muted">
        —
      </p>
    );
  }

  return (
    <>
      <ul className="mt-4 grid gap-4">
        {team.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setSelected(m)}
              className="flex w-full flex-wrap items-center gap-5 rounded-2xl border border-line bg-white p-5 text-start transition hover:border-ink hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-knx md:p-6"
            >
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover object-top"
                  loading="lazy"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-2xl bg-knx-50 text-xl font-bold text-knx-700"
                >
                  {initials(m.name)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-ink">{m.name}</p>
                {m.role && <p className="mt-1 text-sm text-ink-muted">{m.role}</p>}
                {m.company && <p className="mt-1 text-xs text-ink-muted">{m.company}</p>}
              </div>
              {m.is_partner && (
                <div className="flex items-center gap-2 rounded-full border border-line bg-knx-50 px-3 py-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/KNX_logo.svg.png" alt="KNX partner" className="h-6 w-auto" />
                  <span className="text-xs font-semibold text-knx-700">
                    {dict.membersSection.partnerLabel}
                  </span>
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <MemberModal member={selected} closeLabel={dict.close} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function MemberModal({
  member,
  closeLabel,
  onClose,
}: {
  member: TeamMemberItem;
  closeLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={member.name}
      dir="ltr"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 text-ink-muted transition hover:border-ink hover:text-ink"
        >
          ✕
        </button>

        <div className="grid gap-0 md:grid-cols-[220px_1fr]">
          {/* Photo — left-hand side */}
          <div className="flex items-center justify-center bg-knx-50 p-6 md:p-8">
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo_url}
                alt={member.name}
                className="h-40 w-40 rounded-2xl object-cover object-top md:h-44 md:w-44"
              />
            ) : (
              <span className="grid h-40 w-40 place-items-center rounded-2xl bg-white text-4xl font-bold text-knx-700 md:h-44 md:w-44">
                {initials(member.name)}
              </span>
            )}
          </div>

          {/* Details — English */}
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-ink">{member.name}</h2>
            {member.is_partner && (
              <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-knx-50 px-3 py-1 text-xs font-semibold text-knx-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/KNX_logo.svg.png" alt="KNX partner" className="h-4 w-auto" />
                KNX partner
              </span>
            )}

            <dl className="mt-5 space-y-4 text-sm">
              <Detail label="Role / Position" value={member.role} />
              <Detail label="Company" value={member.company} />
              <Detail label="Experience" value={member.experience} />
              <Detail
                label="Contact phone"
                value={member.phone}
                href={member.phone ? `tel:${member.phone.replace(/\s+/g, "")}` : undefined}
              />
              <Detail
                label="URL"
                value={member.email}
                href={member.email ?? undefined}
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-knx-700">{label}</dt>
      <dd className="mt-1 text-ink">
        {href ? (
          <a href={href} className="font-medium text-ink hover:text-knx-700">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function initials(name: string) {
  return (
    name
      .replace(/^(م\.|د\.|أ\.|Eng\.|Dr\.|Mr\.|Ms\.)\s*/i, "")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase() || "·"
  );
}
