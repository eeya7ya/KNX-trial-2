import { NextResponse } from "next/server";
import { ensureSchema, isContentTable, pickContentFields, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ table: string; id: string }> },
) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { table, id } = await ctx.params;
  if (!isContentTable(table))
    return NextResponse.json({ ok: false, error: "Bad table" }, { status: 400 });
  const numId = Number(id);
  if (!Number.isFinite(numId))
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const d = pickContentFields(table, body);
  await ensureSchema();

  if (table === "news") {
    await sql`UPDATE news SET title = ${d.title}, body = ${d.body},
      image_url = ${d.image_url}, event_date = ${d.event_date},
      published = ${d.published} WHERE id = ${numId}`;
  } else if (table === "videos") {
    await sql`UPDATE videos SET title = ${d.title}, url = ${d.url},
      description = ${d.description}, news_id = ${d.news_id ? Number(d.news_id) : null},
      published = ${d.published} WHERE id = ${numId}`;
  } else if (table === "pictures") {
    await sql`UPDATE pictures SET title = ${d.title}, url = ${d.url},
      description = ${d.description}, news_id = ${d.news_id ? Number(d.news_id) : null},
      published = ${d.published} WHERE id = ${numId}`;
  } else if (table === "prompts") {
    await sql`UPDATE prompts SET title = ${d.title}, body = ${d.body},
      tags = ${d.tags}, published = ${d.published} WHERE id = ${numId}`;
  } else if (table === "team_members") {
    await sql`UPDATE team_members SET name = ${d.name}, role = ${d.role},
      company = ${d.company}, photo_url = ${d.photo_url}, is_partner = ${d.is_partner},
      experience = ${d.experience}, phone = ${d.phone}, email = ${d.email},
      published = ${d.published} WHERE id = ${numId}`;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ table: string; id: string }> },
) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { table, id } = await ctx.params;
  if (!isContentTable(table))
    return NextResponse.json({ ok: false, error: "Bad table" }, { status: 400 });
  const numId = Number(id);
  if (!Number.isFinite(numId))
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  await ensureSchema();
  if (table === "news") await sql`DELETE FROM news WHERE id = ${numId}`;
  else if (table === "videos") await sql`DELETE FROM videos WHERE id = ${numId}`;
  else if (table === "pictures") await sql`DELETE FROM pictures WHERE id = ${numId}`;
  else if (table === "prompts") await sql`DELETE FROM prompts WHERE id = ${numId}`;
  else if (table === "team_members") await sql`DELETE FROM team_members WHERE id = ${numId}`;
  return NextResponse.json({ ok: true });
}
