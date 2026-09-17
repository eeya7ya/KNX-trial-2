import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { WINDOW_FIRST, WINDOW_LAST } from "@/lib/webinars";
import { AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type Assignment = {
  id: number;
  name: string;
  experience: string | null;
  photo_url: string | null;
  webinar_title: string;
  slot: string;
  locale: string | null;
  created_at: string;
};

export default async function WebinarAssignmentsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, name, experience, photo_url, webinar_title,
           to_char(slot_date, 'YYYY-MM-DD') AS slot, locale, created_at
    FROM webinar_assignments
    ORDER BY slot_date ASC
  `) as Assignment[];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Webinar slots</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Presenter submissions from <code>/WebinarsAssign</code>. One presenter per day — a day
        listed here is closed on the booking page. Window: {WINDOW_FIRST} → {WINDOW_LAST}.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center text-sm text-ink-muted">
          No slots booked yet.
        </p>
      ) : (
        <div className="mt-6 grid max-w-3xl gap-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-full bg-neutral-100" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-ink-muted">{r.webinar_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700" dir="ltr">
                    {r.slot}
                  </span>
                  <span dir="ltr">{new Date(r.created_at).toLocaleString()}</span>
                </div>
              </div>
              {r.experience && (
                <p className="mt-2 whitespace-pre-line border-t border-line pt-2 text-xs text-ink-muted">
                  {r.experience}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
