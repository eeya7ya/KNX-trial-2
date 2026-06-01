import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema, isContentTable, sql, type ContentTable } from "@/lib/db";
import { AdminShell } from "../../AdminShell";
import { ContentManager } from "./ContentManager";

export const dynamic = "force-dynamic";

type FieldMeta = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "checkbox" | "datetime" | "select";
  required?: boolean;
  upload?: { kind: "image" | "video" | "file"; accept: string };
  options?: { value: string; label: string }[];
};

const META: Record<ContentTable, { label: string; fields: FieldMeta[] }> = {
  news: {
    label: "News",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea", required: true },
      {
        name: "image_url",
        label: "Cover image",
        type: "url",
        upload: { kind: "image", accept: "image/*" },
      },
      { name: "event_date", label: "Event date", type: "datetime" },
    ],
  },
  videos: {
    label: "Videos",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "url",
        label: "Video URL (YouTube, Vimeo, or upload mp4)",
        type: "url",
        required: true,
        upload: { kind: "video", accept: "video/*" },
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "news_id", label: "Event (appears in gallery 7 days after)", type: "select" },
    ],
  },
  pictures: {
    label: "Pictures",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "url",
        label: "Image URL",
        type: "url",
        required: true,
        upload: { kind: "image", accept: "image/*" },
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "news_id", label: "Event (appears in gallery 7 days after)", type: "select" },
    ],
  },
  prompts: {
    label: "Prompts",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Prompt text", type: "textarea", required: true },
      { name: "tags", label: "Tags (comma separated)", type: "text" },
    ],
  },
  events: {
    label: "Events",
    fields: [
      { name: "tag", label: "Type (e.g. Workshop, Meetup, Conference)", type: "text" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "meta", label: "Location & timing (e.g. Amman · Spring 2026)", type: "text" },
      { name: "event_date", label: "Event date (optional, for ordering)", type: "datetime" },
    ],
  },
  team_members: {
    label: "Team",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role / position", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "experience", label: "Experience", type: "text" },
      { name: "phone", label: "Contact phone", type: "text" },
      { name: "email", label: "Contact email", type: "text" },
      {
        name: "photo_url",
        label: "Photo",
        type: "url",
        upload: { kind: "image", accept: "image/*" },
      },
      { name: "is_partner", label: "Mark as KNX partner (shows partner logo)", type: "checkbox" },
    ],
  },
};

type Row = {
  id: number;
  title?: string;
  name?: string;
  created_at: string;
  published: boolean;
  [k: string]: unknown;
};

async function loadRows(table: ContentTable): Promise<Row[]> {
  await ensureSchema();
  if (table === "news")
    return (await sql`SELECT * FROM news ORDER BY created_at DESC LIMIT 200`) as Row[];
  if (table === "videos")
    return (await sql`SELECT * FROM videos ORDER BY created_at DESC LIMIT 200`) as Row[];
  if (table === "pictures")
    return (await sql`SELECT * FROM pictures ORDER BY created_at DESC LIMIT 200`) as Row[];
  if (table === "team_members")
    return (await sql`SELECT * FROM team_members ORDER BY is_partner DESC, created_at ASC LIMIT 200`) as Row[];
  if (table === "events")
    return (await sql`SELECT * FROM events ORDER BY COALESCE(event_date, created_at) ASC LIMIT 200`) as Row[];
  return (await sql`SELECT * FROM prompts ORDER BY created_at DESC LIMIT 200`) as Row[];
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { table } = await params;
  if (!isContentTable(table)) notFound();
  const meta = META[table];
  const rows = await loadRows(table);

  // Populate the event dropdown for media tables with the available news posts.
  let fields = meta.fields;
  if (table === "videos" || table === "pictures") {
    const newsRows = (await sql`
      SELECT id, title FROM news ORDER BY COALESCE(event_date, created_at) DESC LIMIT 200
    `) as { id: number; title: string }[];
    const options = newsRows.map((n) => ({ value: String(n.id), label: n.title }));
    fields = meta.fields.map((f) => (f.name === "news_id" ? { ...f, options } : f));
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">{meta.label}</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Add, view, and remove {meta.label.toLowerCase()}.
      </p>
      <ContentManager
        table={table}
        fields={fields}
        initialRows={rows.map((r) => ({
          ...r,
          id: r.id,
          title: r.title ?? r.name ?? "",
          created_at: r.created_at,
          published: r.published,
        }))}
      />
    </AdminShell>
  );
}
