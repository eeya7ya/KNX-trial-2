import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  created_at: string;
};

export default async function MembersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, name, email, role, created_at
    FROM members ORDER BY created_at DESC LIMIT 500
  `) as Member[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Signups</h1>
      <p className="mt-2 text-sm text-ink-muted">
        People who submitted the join form on the site. Each signup also triggers a
        notification email to the club inbox.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center text-sm text-ink-muted">
          No signups yet.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-ink-muted">{rows.length} total</p>
          <div className="mt-6 grid max-w-2xl gap-2">
            {rows.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <a
                    href={`mailto:${m.email}`}
                    className="block truncate text-xs text-ink-muted hover:text-knx-700"
                    dir="ltr"
                  >
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  {m.role && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium">
                      {m.role}
                    </span>
                  )}
                  <span dir="ltr">{new Date(m.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}
