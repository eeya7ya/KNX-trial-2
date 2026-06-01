import { NextResponse } from "next/server";
import { ensureSchema, isContentTable, pickContentFields, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Row = Record<string, unknown>;

export async function GET(_: Request, ctx: { params: Promise<{ table: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { table } = await ctx.params;
  if (!isContentTable(table))
    return NextResponse.json({ ok: false, error: "Bad table" }, { status: 400 });
  await ensureSchema();
  let rows: unknown[] = [];
  if (table === "news")
    rows = await sql`SELECT * FROM news ORDER BY created_at DESC LIMIT 200`;
  else if (table === "videos")
    rows = await sql`SELECT * FROM videos ORDER BY created_at DESC LIMIT 200`;
  else if (table === "pictures")
    rows = await sql`SELECT * FROM pictures ORDER BY created_at DESC LIMIT 200`;
  else if (table === "prompts")
    rows = await sql`SELECT * FROM prompts ORDER BY created_at DESC LIMIT 200`;
  else if (table === "team_members")
    rows = await sql`SELECT * FROM team_members ORDER BY is_partner DESC, created_at ASC LIMIT 200`;
  return NextResponse.json({ ok: true, rows });
}

export async function POST(req: Request, ctx: { params: Promise<{ table: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { table } = await ctx.params;
  if (!isContentTable(table))
    return NextResponse.json({ ok: false, error: "Bad table" }, { status: 400 });

  let body: Row;
  try {
    body = (await req.json()) as Row;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const data = pickContentFields(table, body);
  await ensureSchema();

  if (table === "news") {
    await sql`INSERT INTO news (title, body, image_url, event_date, published)
      VALUES (${data.title}, ${data.body}, ${data.image_url}, ${data.event_date}, ${data.published})`;
  } else if (table === "videos") {
    await sql`INSERT INTO videos (title, url, description, news_id, published)
      VALUES (${data.title}, ${data.url}, ${data.description},
        ${data.news_id ? Number(data.news_id) : null}, ${data.published})`;
  } else if (table === "pictures") {
    await sql`INSERT INTO pictures (title, url, description, news_id, published)
      VALUES (${data.title}, ${data.url}, ${data.description},
        ${data.news_id ? Number(data.news_id) : null}, ${data.published})`;
  } else if (table === "prompts") {
    await sql`INSERT INTO prompts (title, body, tags, published)
      VALUES (${data.title}, ${data.body}, ${data.tags}, ${data.published})`;
  } else if (table === "team_members") {
    await sql`INSERT INTO team_members
        (name, role, company, photo_url, is_partner, experience, phone, email, published)
      VALUES (${data.name}, ${data.role}, ${data.company}, ${data.photo_url},
        ${data.is_partner}, ${data.experience}, ${data.phone}, ${data.email}, ${data.published})`;
  }
  return NextResponse.json({ ok: true });
}
