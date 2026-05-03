import { NextResponse } from "next/server";
import { ensureSchema, isContentTable, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Row = Record<string, unknown>;

function fields(table: string): string[] {
  switch (table) {
    case "news":
      return ["title", "body", "image_url", "published"];
    case "videos":
      return ["title", "url", "description", "published"];
    case "pictures":
      return ["title", "url", "description", "published"];
    case "prompts":
      return ["title", "body", "tags", "published"];
    default:
      return [];
  }
}

function pickFields(table: string, body: Row) {
  const out: Record<string, unknown> = {};
  for (const f of fields(table)) {
    let v = body[f];
    if (f === "published") {
      v = v === undefined ? true : Boolean(v);
    } else if (typeof v !== "string" || v.trim() === "") {
      v = null;
    } else {
      v = v.trim();
    }
    out[f] = v;
  }
  return out;
}

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

  const data = pickFields(table, body);
  await ensureSchema();

  if (table === "news") {
    await sql`INSERT INTO news (title, body, image_url, published)
      VALUES (${data.title}, ${data.body}, ${data.image_url}, ${data.published})`;
  } else if (table === "videos") {
    await sql`INSERT INTO videos (title, url, description, published)
      VALUES (${data.title}, ${data.url}, ${data.description}, ${data.published})`;
  } else if (table === "pictures") {
    await sql`INSERT INTO pictures (title, url, description, published)
      VALUES (${data.title}, ${data.url}, ${data.description}, ${data.published})`;
  } else if (table === "prompts") {
    await sql`INSERT INTO prompts (title, body, tags, published)
      VALUES (${data.title}, ${data.body}, ${data.tags}, ${data.published})`;
  }
  return NextResponse.json({ ok: true });
}
