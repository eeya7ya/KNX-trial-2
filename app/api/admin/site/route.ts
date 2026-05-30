import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSiteSettingKey, SITE_SETTING_KEYS } from "@/lib/site-content";

export const runtime = "nodejs";

/**
 * Upsert one or more editable homepage sections. Body may contain any of the
 * keys in SITE_SETTING_KEYS (stats, about, services); each present key is
 * stored as JSON and overrides the static i18n defaults.
 */
export async function POST(req: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  await ensureSchema();

  for (const key of SITE_SETTING_KEYS) {
    if (!(key in body)) continue;
    if (!isSiteSettingKey(key)) continue;
    const value = JSON.stringify(body[key]);
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${key}, ${value}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }

  return NextResponse.json({ ok: true });
}
