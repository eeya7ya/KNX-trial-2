import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: Request) {
  let body: { path?: unknown; locale?: unknown } = {};
  try {
    body = await req.json();
  } catch {}

  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 8) : null;
  const ua = (req.headers.get("user-agent") || "").slice(0, 400);
  const referer = (req.headers.get("referer") || "").slice(0, 400);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "";

  try {
    await ensureSchema();
    await sql`
      INSERT INTO visitors (path, locale, ip, user_agent, referer)
      VALUES (${path}, ${locale}, ${ip || null}, ${ua || null}, ${referer || null})
    `;
  } catch (err) {
    console.error("track error", err);
  }
  return NextResponse.json({ ok: true });
}
