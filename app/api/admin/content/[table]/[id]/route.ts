import { NextResponse } from "next/server";
import { ensureSchema, isContentTable, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

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
