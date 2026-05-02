"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";

type Status = "idle" | "submitting" | "success" | "error";

export function JoinForm({ dict, locale }: { dict: Dict; locale: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
      locale,
    };

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setStatus("error");
        setMessage(body.error ?? dict.join.serverError);
        return;
      }
      setStatus("success");
      setMessage(dict.join.success);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(dict.join.networkError);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={dict.join.name}>
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="w-full border-0 border-b border-line bg-transparent px-0 py-3 text-base outline-none transition focus:border-knx"
          />
        </Field>
        <Field label={dict.join.email}>
          <input
            type="email"
            name="email"
            required
            maxLength={200}
            dir="ltr"
            className="w-full border-0 border-b border-line bg-transparent px-0 py-3 text-base outline-none transition focus:border-knx"
          />
        </Field>
      </div>
      <Field label={dict.join.role}>
        <input
          name="role"
          maxLength={120}
          placeholder={dict.join.rolePlaceholder}
          className="w-full border-0 border-b border-line bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-neutral-400 focus:border-knx"
        />
      </Field>
      <div className="mt-3 flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-knx-700 disabled:opacity-60"
        >
          <span>
            {status === "submitting" ? dict.join.submitting : dict.join.submit}
          </span>
          <span className="transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
            →
          </span>
        </button>
        {status === "success" && (
          <p className="text-sm text-knx-700">{message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">{message}</p>
        )}
      </div>
    </form>
  );
}

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
