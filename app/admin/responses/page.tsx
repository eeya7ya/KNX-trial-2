import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type JoinResponse = {
  id: number;
  name: string | null;
  email: string;
  action: string;
  created_at: string;
};

export default async function ResponsesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, name, email, action, created_at
    FROM join_responses ORDER BY created_at DESC LIMIT 200
  `) as JoinResponse[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Join responses</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Replies from recipients who clicked “Proceed Joining” or “Cancel Joining” in a welcome email.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center text-sm text-ink-muted">
          No responses yet.
        </p>
      ) : (
        <div className="mt-6 grid max-w-2xl gap-2">
          {rows.map((r) => {
            const proceed = r.action === "proceed";
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name || "(no name)"}</p>
                  <p className="truncate text-xs text-ink-muted" dir="ltr">
                    {r.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      proceed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {proceed ? "Proceed" : "Cancel"}
                  </span>
                  <span dir="ltr">{new Date(r.created_at).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
