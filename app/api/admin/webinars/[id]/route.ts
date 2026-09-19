import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

/**
 * Give a booked day back. The UNIQUE on slot_date is what closes a day to
 * everyone else, so deleting the row is the only way a day that was taken by
 * mistake — or by a presenter who dropped out — ever reopens on
 * /WebinarsAssign.
 */
export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isFinite(numId))
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  await ensureSchema();
  await sql`DELETE FROM webinar_assignments WHERE id = ${numId}`;
  return NextResponse.json({ ok: true });
}
