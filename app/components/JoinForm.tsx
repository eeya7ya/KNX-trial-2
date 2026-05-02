"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function JoinForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

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
        setMessage(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thanks — you're on the list. We'll be in touch.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-800">
            Full name
          </span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-knx focus:ring-2 focus:ring-knx/30"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-800">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            maxLength={200}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-knx focus:ring-2 focus:ring-knx/30"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-800">
          Role (optional)
        </span>
        <input
          name="role"
          maxLength={120}
          placeholder="Integrator, engineer, architect, student…"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-knx focus:ring-2 focus:ring-knx/30"
        />
      </label>
      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-md bg-knx px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-dark disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Sign me up"}
        </button>
        {status === "success" && (
          <p className="text-sm text-knx-dark">{message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">{message}</p>
        )}
      </div>
    </form>
  );
}
