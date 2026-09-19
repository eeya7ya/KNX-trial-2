"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Slot = {
  id: number;
  name: string;
  experience: string | null;
  photo_url: string | null;
  webinar_title: string;
  /** The booked day, YYYY-MM-DD. */
  slot: string;
  /** "Sun 20 Sep 2026" — built on the server so the two renders agree. */
  slot_label: string;
  /** False once the day has passed, so the calendar reads in two halves. */
  upcoming: boolean;
  locale: string | null;
  submitted: string;
};

export function WebinarSlotsList({ initialRows }: { initialRows: Slot[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Slot[]>(initialRows);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function remove(slot: Slot) {
    if (
      !confirm(
        `Delete ${slot.name}'s booking for ${slot.slot_label}?\n\n` +
          "The day becomes available again on /WebinarsAssign.",
      )
    )
      return;
    setBusyId(slot.id);
    try {
      const res = await fetch(`/api/admin/webinars/${slot.id}`, { method: "DELETE" });
      if (res.ok) setRows((rs) => rs.filter((r) => r.id !== slot.id));
    } finally {
      setBusyId(null);
      router.refresh();
    }
  }

  if (rows.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center text-sm text-ink-muted">
        No slots booked yet.
      </p>
    );
  }

  const upcoming = rows.filter((r) => r.upcoming);
  const past = rows.filter((r) => !r.upcoming);

  return (
    <div className="mt-6 grid max-w-3xl gap-6">
      <Group title="Upcoming" rows={upcoming} busyId={busyId} onRemove={remove} empty="Nothing booked ahead." />
      {past.length > 0 && <Group title="Past" rows={past} busyId={busyId} onRemove={remove} />}
    </div>
  );
}

function Group({
  title,
  rows,
  busyId,
  onRemove,
  empty,
}: {
  title: string;
  rows: Slot[];
  busyId: number | null;
  onRemove: (slot: Slot) => void;
  /** Only the groups that are drawn while empty need this. */
  empty?: string;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {title} · {rows.length}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-2 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-muted">
          {empty}
        </p>
      ) : (
        <div className="mt-2 grid gap-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border border-line bg-white px-4 py-3 ${
                r.upcoming ? "" : "opacity-80"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-full bg-neutral-100" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-ink-muted">{r.webinar_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      r.upcoming ? "bg-green-100 text-green-700" : "bg-neutral-100 text-ink-muted"
                    }`}
                    dir="ltr"
                  >
                    {r.slot_label}
                  </span>
                  <span dir="ltr">{r.submitted}</span>
                </div>
              </div>
              {r.experience && (
                <p className="mt-2 whitespace-pre-line border-t border-line pt-2 text-xs text-ink-muted">
                  {r.experience}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.photo_url && (
                  <a
                    href={r.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink hover:text-ink"
                  >
                    Open photo
                  </a>
                )}
                <span className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted">
                  Submitted in {r.locale === "en" ? "English" : "Arabic"}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(r)}
                  disabled={busyId === r.id}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  Delete · frees the day
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
