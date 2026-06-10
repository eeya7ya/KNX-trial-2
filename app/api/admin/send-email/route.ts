import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let body: {
    to?: string;
    subject?: string;
    body?: string;
    name?: string;
    joinActions?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const to = (body.to ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.body ?? "").trim();
  const name = (body.name ?? "").trim();
  const joinActions = body.joinActions ? { name } : undefined;

  if (!EMAIL_RE.test(to))
    return NextResponse.json({ ok: false, error: "Enter a valid recipient email." }, { status: 400 });
  if (!subject)
    return NextResponse.json({ ok: false, error: "Subject is required." }, { status: 400 });
  if (!message)
    return NextResponse.json({ ok: false, error: "Message body is required." }, { status: 400 });

  await ensureSchema();

  try {
    const { id } = await sendEmail({ to, subject, body: message, joinActions });
    await sql`
      INSERT INTO emails_sent (to_email, subject, body, status, provider_id)
      VALUES (${to}, ${subject}, ${message}, 'sent', ${id})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await sql`
      INSERT INTO emails_sent (to_email, subject, body, status, error)
      VALUES (${to}, ${subject}, ${message}, 'failed', ${errMsg})
    `;
    console.error("send-email error", errMsg);
    return NextResponse.json(
      { ok: false, error: "Failed to send. Check your Resend setup and try again." },
      { status: 502 },
    );
  }
}
