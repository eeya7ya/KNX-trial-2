"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type SentEmail = {
  id: number;
  to_email: string;
  subject: string | null;
  status: string;
  error: string | null;
  created_at: string;
};

export function EmailComposer({ initialSent }: { initialSent: SentEmail[] }) {
  const router = useRouter();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setResult({ ok: true, msg: `Sent to ${to}.` });
        setTo("");
        setSubject("");
        setBody("");
        router.refresh();
      } else {
        setResult({ ok: false, msg: data.error || "Failed to send." });
      }
    } catch {
      setResult({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={send} className="mt-6 grid max-w-xl gap-4 rounded-2xl border border-line bg-white p-5">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">To</span>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Subject</span>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Message</span>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="resize-y rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send email"}
          </button>
          {result && (
            <span className={`text-sm ${result.ok ? "text-green-600" : "text-red-600"}`}>
              {result.msg}
            </span>
          )}
        </div>
      </form>

      <h2 className="mt-10 text-lg font-semibold">Recently sent</h2>
      {initialSent.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-white p-6 text-center text-sm text-ink-muted">
          No emails sent yet.
        </p>
      ) : (
        <div className="mt-3 grid max-w-2xl gap-2">
          {initialSent.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.subject || "(no subject)"}</p>
                <p className="truncate text-xs text-ink-muted" dir="ltr">
                  {s.to_email}
                </p>
                {s.status === "failed" && s.error && (
                  <p className="mt-0.5 text-xs text-red-600">{s.error}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    s.status === "sent"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.status}
                </span>
                <span dir="ltr">{new Date(s.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
