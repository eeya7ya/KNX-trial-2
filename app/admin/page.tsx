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
  return {
    members: members.n,
    visitors: visitors.n,
    communications: comms.n,
    news: news.n,
    videos: videos.n,
    pictures: pictures.n,
    prompts: prompts.n,
  };
}

export default async function AdminHome() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const stats = await getStats();
  const cards: { label: string; n: number }[] = [
    { label: "Members", n: stats.members },
    { label: "Visitors", n: stats.visitors },
    { label: "Communications", n: stats.communications },
    { label: "News", n: stats.news },
    { label: "Videos", n: stats.videos },
    { label: "Pictures", n: stats.pictures },
    { label: "Prompts", n: stats.prompts },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-ink-muted">Overview of activity on the KNX Club site.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{c.n}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
