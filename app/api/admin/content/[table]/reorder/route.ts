import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Tables that support manual ordering via a sort_order column.
const REORDERABLE = new Set(["team_members"]);

/**
 * Persist a manual display order. Body: { ids: number[] } — the row ids in the
 * desired top-to-bottom order. Each id's sort_order is set to its position.
 */
export async function POST(req: Request, ctx: { params: Promise<{ table: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { table } = await ctx.params;
  if (!REORDERABLE.has(table))
    return NextResponse.json({ ok: false, error: "Table is not reorderable" }, { status: 400 });

  let body: { ids?: unknown };
  try {
    body = (await req.json()) as { ids?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.some((id) => !Number.isFinite(Number(id))))
    return NextResponse.json({ ok: false, error: "ids must be an array of numbers" }, { status: 400 });

  const ids = body.ids.map((id) => Number(id));
  await ensureSchema();

  // One statement: map each id to its 1-based position via the provided arrays.
  await sql`
    UPDATE team_members AS t
    SET sort_order = o.position
    FROM (
      SELECT id, ordinality AS position
      FROM unnest(${ids}::int[]) WITH ORDINALITY AS u(id, ordinality)
    ) AS o
    WHERE t.id = o.id
  `;

  return NextResponse.json({ ok: true });
}
