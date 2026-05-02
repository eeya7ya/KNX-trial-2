import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type Visitor = {
  id: number;
  path: string;
  locale: string | null;
  ip: string | null;
  user_agent: string | null;
  referer: string | null;
  created_at: string;
};

export default async function VisitorsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, path, locale, ip, user_agent, referer, created_at
    FROM visitors ORDER BY created_at DESC LIMIT 500
  `) as Visitor[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
      <p className="mt-2 text-sm text-ink-muted">Last 500 visits.</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Locale</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">User agent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-t border-line">
                <td className="px-4 py-3 text-ink-muted" dir="ltr">
                  {new Date(v.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium" dir="ltr">{v.path}</td>
                <td className="px-4 py-3 text-ink-muted">{v.locale || "—"}</td>
                <td className="px-4 py-3 text-ink-muted" dir="ltr">{v.ip || "—"}</td>
                <td className="max-w-md truncate px-4 py-3 text-ink-muted" dir="ltr" title={v.user_agent || ""}>
                  {v.user_agent || "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No visits recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
