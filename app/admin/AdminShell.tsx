"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/site", label: "Homepage content" },
  { href: "/admin/communications", label: "Communications" },
  { href: "/admin/members", label: "Signups" },
  { href: "/admin/email", label: "Send email" },
  { href: "/admin/responses", label: "Join responses" },
  { href: "/admin/content/news", label: "News" },
  { href: "/admin/content/videos", label: "Videos" },
  { href: "/admin/content/pictures", label: "Pictures" },
  { href: "/admin/content/prompts", label: "Prompts" },
  { href: "/admin/content/team_members", label: "Team" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="border-r border-line bg-white p-5">
        <div className="mb-6 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/KNX_logo.svg.png"
            alt="KNX Club Jordan"
            className="h-9 w-auto"
            draggable={false}
          />
          <p className="text-lg font-bold">Admin</p>
        </div>
        <Link
          href="/"
          className="mb-4 flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-muted transition hover:border-ink hover:text-ink"
        >
          ← View site
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-ink text-white"
                    : "text-ink-muted hover:bg-neutral-100 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          className="mt-6 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
        >
          Sign out
        </button>
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}
