"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  LocalizedAbout,
  LocalizedServices,
  LocalizedStats,
} from "@/lib/site-content";

type Initial = {
  stats: LocalizedStats;
  about: LocalizedAbout;
  services: LocalizedServices;
};

type StatRow = { value_en: string; label_en: string; value_ar: string; label_ar: string };
type ServiceRow = { title_en: string; body_en: string; title_ar: string; body_ar: string };

export function SiteContentEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [stats, setStats] = useState<StatRow[]>(() =>
    initial.stats.en.map((s, i) => ({
      value_en: s.value,
      label_en: s.label,
      value_ar: initial.stats.ar[i]?.value ?? s.value,
      label_ar: initial.stats.ar[i]?.label ?? "",
    })),
  );

  const [about, setAbout] = useState({
    title_en: initial.about.en.title,
    body_en: initial.about.en.body,
    title_ar: initial.about.ar.title,
    body_ar: initial.about.ar.body,
  });

  const [services, setServices] = useState<ServiceRow[]>(() =>
    initial.services.en.map((s, i) => ({
      title_en: s.title,
      body_en: s.body,
      title_ar: initial.services.ar[i]?.title ?? "",
      body_ar: initial.services.ar[i]?.body ?? "",
    })),
  );

  function updateStat(i: number, key: keyof StatRow, v: string) {
    setStats((rows) => rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  }
  function updateService(i: number, key: keyof ServiceRow, v: string) {
    setServices((rows) => rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  }
  function addService() {
    setServices((rows) => [...rows, { title_en: "", body_en: "", title_ar: "", body_ar: "" }]);
  }
  function removeService(i: number) {
    setServices((rows) => rows.filter((_, j) => j !== i));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const payload = {
      stats: {
        en: stats.map((s) => ({ value: s.value_en, label: s.label_en })),
        ar: stats.map((s) => ({ value: s.value_ar, label: s.label_ar })),
      },
      about: {
        en: { title: about.title_en, body: about.body_en },
        ar: { title: about.title_ar, body: about.body_ar },
      },
      services: {
        en: services
          .filter((s) => s.title_en.trim() || s.title_ar.trim())
          .map((s) => ({ title: s.title_en, body: s.body_en })),
        ar: services
          .filter((s) => s.title_en.trim() || s.title_ar.trim())
          .map((s) => ({ title: s.title_ar, body: s.body_ar })),
      },
    };
    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setMsg({ kind: "err", text: body.error || "Failed to save" });
        return;
      }
      setMsg({ kind: "ok", text: "Saved. The homepage is updated." });
      router.refresh();
    } catch {
      setMsg({ kind: "err", text: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-10">
      {/* STATS */}
      <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <h2 className="text-lg font-semibold">Homepage stats</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The big numbers shown on the homepage hero. Use a value like{" "}
          <code className="rounded bg-neutral-100 px-1">+38</code> or{" "}
          <code className="rounded bg-neutral-100 px-1">38+</code>.
        </p>
        <div className="mt-4 space-y-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-xl border border-line p-4 md:grid-cols-2"
            >
              <Field label="Value (EN)">
                <input
                  value={s.value_en}
                  onChange={(e) => updateStat(i, "value_en", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Value (AR)">
                <input
                  dir="rtl"
                  value={s.value_ar}
                  onChange={(e) => updateStat(i, "value_ar", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Label (EN)">
                <input
                  value={s.label_en}
                  onChange={(e) => updateStat(i, "label_en", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Label (AR)">
                <input
                  dir="rtl"
                  value={s.label_ar}
                  onChange={(e) => updateStat(i, "label_ar", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <h2 className="text-lg font-semibold">About section</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Title (EN)">
            <input
              value={about.title_en}
              onChange={(e) => setAbout((a) => ({ ...a, title_en: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Title (AR)">
            <input
              dir="rtl"
              value={about.title_ar}
              onChange={(e) => setAbout((a) => ({ ...a, title_ar: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Body (EN)">
            <textarea
              rows={4}
              value={about.body_en}
              onChange={(e) => setAbout((a) => ({ ...a, body_en: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Body (AR)">
            <textarea
              dir="rtl"
              rows={4}
              value={about.body_ar}
              onChange={(e) => setAbout((a) => ({ ...a, body_ar: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* SERVICES */}
      <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Services cards</h2>
          <button
            type="button"
            onClick={addService}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink"
          >
            + Add service
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {services.map((s, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Service {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted transition hover:border-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title (EN)">
                  <input
                    value={s.title_en}
                    onChange={(e) => updateService(i, "title_en", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Title (AR)">
                  <input
                    dir="rtl"
                    value={s.title_ar}
                    onChange={(e) => updateService(i, "title_ar", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Description (EN)">
                  <textarea
                    rows={2}
                    value={s.body_en}
                    onChange={(e) => updateService(i, "body_en", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Description (AR)">
                  <textarea
                    dir="rtl"
                    rows={2}
                    value={s.body_ar}
                    onChange={(e) => updateService(i, "body_ar", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-sm text-ink-muted">No services. Add one above.</p>
          )}
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-line bg-neutral-50/80 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        {msg && (
          <p className={`text-sm ${msg.kind === "ok" ? "text-knx-700" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
