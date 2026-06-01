"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Comm = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export function CommunicationsList({ initialRows }: { initialRows: Comm[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Comm[]>(initialRows);
  const [busyId, setBusyId] = useState<number | null>(null);

  const unread = rows.filter((r) => !r.read).length;

  async function setRead(id: number, read: boolean) {
    setBusyId(id);
    // Optimistic update.
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, read } : r)));
    try {
      await fetch(`/api/admin/communications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this message?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/communications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRows((rs) => rs.filter((r) => r.id !== id));
      }
    } finally {
      setBusyId(null);
      router.refresh();
    }
  }

  if (rows.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-ink-muted">
        No messages yet.
      </p>
    );
  }

  return (
    <>
      <p className="mt-1 text-xs text-ink-muted">
        {rows.length} total · {unread} unread
      </p>
      <div className="mt-6 grid gap-3">
        {rows.map((c) => (
          <article
            key={c.id}
            className={`rounded-2xl border bg-white p-5 transition ${
              c.read ? "border-line opacity-80" : "border-knx/50 shadow-sm"
            }`}
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-base font-semibold">
                  {!c.read && (
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-knx"
                    />
                  )}
                  {c.name}
                </p>
                <a
                  href={`mailto:${c.email}`}
                  className="text-xs text-ink-muted hover:text-knx-700"
                  dir="ltr"
                >
                  {c.email}
                </a>
              </div>
              <p className="text-xs text-ink-muted" dir="ltr">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </header>
            {c.subject && <p className="mt-3 text-sm font-medium">{c.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{c.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRead(c.id, !c.read)}
                disabled={busyId === c.id}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
              >
                {c.read ? "Mark as unread" : "Mark as read"}
              </button>
              <a
                href={`mailto:${c.email}${c.subject ? `?subject=Re: ${encodeURIComponent(c.subject)}` : ""}`}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink hover:text-ink"
              >
                Reply
              </a>
              <button
                type="button"
                onClick={() => remove(c.id)}
                disabled={busyId === c.id}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
