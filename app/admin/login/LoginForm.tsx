"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setErr(body.error || "Sign in failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
          Password
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base outline-none transition focus:border-knx"
        />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-700 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
