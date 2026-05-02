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
      <h1 className="text-2xl font-bold tracking-tight">Members</h1>
      <p className="mt-2 text-sm text-ink-muted">{rows.length} signups (last 500).</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3" dir="ltr">{m.email}</td>
                <td className="px-4 py-3 text-ink-muted">{m.role || "—"}</td>
                <td className="px-4 py-3 text-ink-muted" dir="ltr">
                  {new Date(m.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
