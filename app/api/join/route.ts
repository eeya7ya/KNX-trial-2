import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (role.length > 120) {
    return NextResponse.json({ ok: false, error: "Role is too long." }, { status: 400 });
  }

  try {
    await ensureSchema();
    await sql`
      INSERT INTO members (name, email, role)
      VALUES (${name}, ${email}, ${role || null})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("join error", err);
    return NextResponse.json(
      { ok: false, error: "Server error. Please try again later." },
      { status: 500 },
    );
  }
}
