"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMAIL_TEMPLATES, buildBody, getTemplate } from "@/lib/email-templates";

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
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const selectedTemplate = getTemplate(templateId);

  // Re-assemble the subject + body from the chosen template and the recipient's
  // name. Called whenever the template or the name field changes so the admin
  // only has to fill in the client's data.
  function applyTemplate(id: string, recipientName: string) {
    const tpl = getTemplate(id);
    if (!tpl) return;
    setSubject(tpl.subject);
    setBody(buildBody(tpl, recipientName));
  }

  function onTemplateChange(id: string) {
    setTemplateId(id);
    if (id) applyTemplate(id, name);
  }

  function onNameChange(value: string) {
    setName(value);
    if (templateId) applyTemplate(templateId, value);
  }

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
        setTemplateId("");
        setName("");
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
          <span className="text-sm font-medium">Template</span>
          <select
            value={templateId}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="">— Custom (write your own) —</option>
            {EMAIL_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <span className="text-xs text-ink-muted">{selectedTemplate.description}</span>
          )}
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Recipient name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Eng. Ahmad"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
          {selectedTemplate && (
            <span className="text-xs text-ink-muted">
              Inserted into the greeting. The subject and message below are filled
              automatically — edit them if needed before sending.
            </span>
          )}
        </label>
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
