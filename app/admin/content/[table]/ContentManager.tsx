"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Field = { name: string; label: string; type: "text" | "textarea" | "url"; required?: boolean };
type Row = { id: number; title: string; created_at: string; published: boolean };

export function ContentManager({
  table,
  fields,
  initialRows,
}: {
  table: string;
  fields: Field[];
  initialRows: Row[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [published, setPublished] = useState(true);

  function reset() {
    setValues(Object.fromEntries(fields.map((f) => [f.name, ""])));
    setPublished(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/content/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, published }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setErr(body.error || "Failed to save");
        return;
      }
      reset();
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this entry?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/content/${table}/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[420px_1fr]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold">Add new</p>
        <div className="mt-4 grid gap-4">
          {fields.map((f) => (
            <label key={f.name} className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </span>
              {f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  rows={4}
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx"
                />
              ) : (
                <input
                  type={f.type === "url" ? "url" : "text"}
                  required={f.required}
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx"
                />
              )}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-semibold">Existing ({initialRows.length})</p>
        </div>
        <ul className="divide-y divide-line">
          {initialRows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-ink-muted" dir="ltr">
                  {new Date(r.created_at).toLocaleString()}
                  {!r.published && " · draft"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(r.id)}
                disabled={busy}
                className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
          {initialRows.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-ink-muted">No entries yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
