import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isFinite(numId))
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  let body: { read?: boolean };
  try {
    body = (await req.json()) as { read?: boolean };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  await ensureSchema();
  await sql`UPDATE communications SET read = ${Boolean(body.read)} WHERE id = ${numId}`;
  return NextResponse.json({ ok: true });
}

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
  await sql`DELETE FROM communications WHERE id = ${numId}`;
  return NextResponse.json({ ok: true });
}
