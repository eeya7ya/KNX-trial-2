import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, sql } from "@/lib/db";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

async function getStats() {
  await ensureSchema();
  const [members] = (await sql`SELECT COUNT(*)::int AS n FROM members`) as { n: number }[];
  const [visitors] = (await sql`SELECT COUNT(*)::int AS n FROM visitors`) as { n: number }[];
  const [comms] = (await sql`SELECT COUNT(*)::int AS n FROM communications`) as { n: number }[];
  const [news] = (await sql`SELECT COUNT(*)::int AS n FROM news`) as { n: number }[];
  const [videos] = (await sql`SELECT COUNT(*)::int AS n FROM videos`) as { n: number }[];
  const [pictures] = (await sql`SELECT COUNT(*)::int AS n FROM pictures`) as { n: number }[];
  const [prompts] = (await sql`SELECT COUNT(*)::int AS n FROM prompts`) as { n: number }[];
  // A total, like every other card — the upcoming / past split belongs on the
  // slots page itself, where the days are listed.
  const [webinars] = (await sql`
    SELECT COUNT(*)::int AS n FROM webinar_assignments
  `) as { n: number }[];
  return {
    members: members.n,
    visitors: visitors.n,
    communications: comms.n,
    news: news.n,
    videos: videos.n,
    pictures: pictures.n,
    prompts: prompts.n,
    webinars: webinars.n,
  };
}

export default async function AdminHome() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const stats = await getStats();
  const cards: { label: string; n: number; href?: string }[] = [
    { label: "Members", n: stats.members },
    { label: "Visitors", n: stats.visitors },
    { label: "Communications", n: stats.communications },
    { label: "News", n: stats.news },
    { label: "Videos", n: stats.videos },
    { label: "Pictures", n: stats.pictures },
    { label: "Prompts", n: stats.prompts },
    { label: "Webinar slots", n: stats.webinars, href: "/admin/webinars" },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-ink-muted">Overview of activity on the KNX Club site.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => {
          const body = (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                {c.label}
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{c.n}</p>
            </>
          );
          const shell = "rounded-2xl border border-line bg-white p-5";
          return c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className={`${shell} transition hover:border-ink`}
            >
              {body}
            </Link>
          ) : (
            <div key={c.label} className={shell}>
              {body}
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
