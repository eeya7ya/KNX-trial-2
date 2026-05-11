import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { sendAutoReply } from "@/lib/email";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
    locale?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale : "ar";

  if (name.length < 2 || name.length > 120)
    return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  if (message.length < 2 || message.length > 4000)
    return NextResponse.json({ ok: false, error: "Message required" }, { status: 400 });

  try {
    await ensureSchema();
    await sql`
      INSERT INTO communications (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject || null}, ${message})
    `;

    try {
      await sendAutoReply({ to: email, name, kind: "contact", locale });
    } catch (mailErr) {
      console.error("contact auto-reply email failed", mailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
