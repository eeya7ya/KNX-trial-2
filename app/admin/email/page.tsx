import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "../AdminShell";
import { EmailComposer, type SentEmail } from "./EmailComposer";

export const dynamic = "force-dynamic";

export default async function EmailPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const sent = (await sql`
    SELECT id, to_email, subject, status, error, created_at
    FROM emails_sent ORDER BY created_at DESC LIMIT 50
  `) as SentEmail[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Send email</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Compose and send an email through the club&apos;s Resend account.
      </p>
      <EmailComposer initialSent={sent} />
    </AdminShell>
  );
}
