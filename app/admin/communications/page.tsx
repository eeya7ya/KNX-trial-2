import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "../AdminShell";
import { CommunicationsList, type Comm } from "./CommunicationsList";

export const dynamic = "force-dynamic";

export default async function CommunicationsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, name, email, subject, message, read, created_at
    FROM communications ORDER BY read ASC, created_at DESC LIMIT 200
  `) as Comm[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
      <p className="mt-2 text-sm text-ink-muted">Messages sent through the contact form.</p>
      <CommunicationsList initialRows={rows} />
    </AdminShell>
  );
}
