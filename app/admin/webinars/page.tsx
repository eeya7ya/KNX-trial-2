import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { daysInWindow, WINDOW_FIRST, WINDOW_LAST } from "@/lib/webinars";
import { AdminShell } from "../AdminShell";
import { WebinarSlotsList, type Slot } from "./WebinarSlotsList";

export const dynamic = "force-dynamic";

// The club runs on Amman time, so a slot booked for the 20th has to read as
// the 20th here no matter where the server or the admin's laptop happens to
// be. Fixing the zone also keeps the server and client renders identical.
const TZ = "Asia/Amman";

const DAY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", // slot_date is a bare date — UTC keeps it from sliding a day.
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const STAMP = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function WebinarAssignmentsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, name, experience, photo_url, webinar_title,
           to_char(slot_date, 'YYYY-MM-DD') AS slot,
           slot_date >= CURRENT_DATE AS upcoming,
           locale, created_at
    FROM webinar_assignments
    ORDER BY slot_date ASC
  `) as (Omit<Slot, "slot_label" | "submitted"> & { created_at: string })[];

  const slots: Slot[] = rows.map((r) => ({
    ...r,
    slot_label: DAY.format(new Date(`${r.slot}T00:00:00Z`)),
    submitted: STAMP.format(new Date(r.created_at)),
  }));

  const booked = slots.length;
  const upcoming = slots.filter((s) => s.upcoming).length;
  // Bookings can sit outside the window once it is moved on, so the days left
  // open is counted against the window itself, never against the row count.
  const inWindow = slots.filter((s) => s.slot >= WINDOW_FIRST && s.slot <= WINDOW_LAST).length;
  const open = daysInWindow() - inWindow;

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Webinar slots</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Presenter submissions from <code>/WebinarsAssign</code>. One presenter per day — a day
        listed here is closed on the booking page. Window: {WINDOW_FIRST} → {WINDOW_LAST}.
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {booked} booked · {upcoming} upcoming · {open} of {daysInWindow()} days still open
      </p>

      <WebinarSlotsList initialRows={slots} />
    </AdminShell>
  );
}
