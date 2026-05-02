import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type Comm = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

export default async function CommunicationsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, name, email, subject, message, created_at
    FROM communications ORDER BY created_at DESC LIMIT 200
  `) as Comm[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
      <p className="mt-2 text-sm text-ink-muted">Messages sent through the contact form.</p>
      <div className="mt-6 grid gap-3">
        {rows.map((c) => (
          <article key={c.id} className="rounded-2xl border border-line bg-white p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-base font-semibold">{c.name}</p>
                <p className="text-xs text-ink-muted" dir="ltr">{c.email}</p>
              </div>
              <p className="text-xs text-ink-muted" dir="ltr">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </header>
            {c.subject && <p className="mt-3 text-sm font-medium">{c.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{c.message}</p>
          </article>
        ))}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-ink-muted">
            No messages yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
