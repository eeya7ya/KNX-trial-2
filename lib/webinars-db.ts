import { ensureSchema, sql } from "@/lib/db";
import { WINDOW_FIRST, WINDOW_LAST } from "@/lib/webinars";

/* Server-only half of the booking helpers. It is kept apart from
   lib/webinars.ts because the date maths in there is shared with the client
   picker, and lib/db.ts throws the moment it is evaluated without a
   DATABASE_URL — which is every time it reaches a browser. */

/**
 * Days inside the window that already belong to a presenter. A failure here
 * only costs the picker its grey cells — the UNIQUE on slot_date is what
 * actually stops a day being booked twice.
 */
export async function getTakenDates(): Promise<string[]> {
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT to_char(slot_date, 'YYYY-MM-DD') AS iso
      FROM webinar_assignments
      WHERE slot_date BETWEEN ${WINDOW_FIRST}::date AND ${WINDOW_LAST}::date
      ORDER BY slot_date
    `) as { iso: string }[];
    return rows.map((r) => r.iso);
  } catch (err) {
    console.error("getTakenDates error", err);
    return [];
  }
}
