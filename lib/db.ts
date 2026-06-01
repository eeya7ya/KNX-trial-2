import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id          BIGSERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT NOT NULL UNIQUE,
        role        TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS visitors (
        id          BIGSERIAL PRIMARY KEY,
        path        TEXT NOT NULL,
        locale      TEXT,
        ip          TEXT,
        user_agent  TEXT,
        referer     TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS communications (
        id          BIGSERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT NOT NULL,
        subject     TEXT,
        message     TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Read/unread tracking for the admin inbox (added later — keep idempotent).
    await sql`ALTER TABLE communications ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE`;
    await sql`
      CREATE TABLE IF NOT EXISTS news (
        id          BIGSERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        image_url   TEXT,
        published   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id          BIGSERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        url         TEXT NOT NULL,
        description TEXT,
        published   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS pictures (
        id          BIGSERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        url         TEXT NOT NULL,
        description TEXT,
        published   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS prompts (
        id          BIGSERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        tags        TEXT,
        published   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id           BIGSERIAL PRIMARY KEY,
        name         TEXT NOT NULL,
        role         TEXT,
        company      TEXT,
        photo_url    TEXT,
        is_partner   BOOLEAN NOT NULL DEFAULT FALSE,
        published    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Member contact / experience details (added later — keep idempotent).
    await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS experience TEXT`;
    await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS phone TEXT`;
    await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email TEXT`;
    // News posts are events with a date; photos/videos can be attached to one.
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ`;
    await sql`ALTER TABLE pictures ADD COLUMN IF NOT EXISTS news_id BIGINT`;
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS news_id BIGINT`;
    // Editable homepage content (stats, about, services) keyed by section.
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key         TEXT PRIMARY KEY,
        value       JSONB NOT NULL,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

export const CONTENT_TABLES = ["news", "videos", "pictures", "prompts", "team_members"] as const;
export type ContentTable = (typeof CONTENT_TABLES)[number];

export function isContentTable(value: string): value is ContentTable {
  return (CONTENT_TABLES as readonly string[]).includes(value);
}

// Column lists used by the admin create/update API. Keep in sync with the
// admin form metadata in app/admin/content/[table]/page.tsx.
export const CONTENT_FIELDS: Record<ContentTable, string[]> = {
  news: ["title", "body", "image_url", "event_date", "published"],
  videos: ["title", "url", "description", "news_id", "published"],
  pictures: ["title", "url", "description", "news_id", "published"],
  prompts: ["title", "body", "tags", "published"],
  team_members: [
    "name",
    "role",
    "company",
    "photo_url",
    "is_partner",
    "experience",
    "phone",
    "email",
    "published",
  ],
};

export const BOOL_CONTENT_FIELDS = new Set(["published", "is_partner"]);

/** Normalise a raw request body into the columns a content table accepts. */
export function pickContentFields(
  table: ContentTable,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of CONTENT_FIELDS[table]) {
    let v = body[f];
    if (BOOL_CONTENT_FIELDS.has(f)) {
      const def = f === "published" ? true : false;
      v = v === undefined ? def : Boolean(v);
    } else if (typeof v !== "string" || v.trim() === "") {
      v = null;
    } else {
      v = v.trim();
    }
    out[f] = v;
  }
  return out;
}

export type NewsItem = {
  id: number;
  title: string;
  body: string;
  image_url: string | null;
  event_date: string | null;
  created_at: string;
};
export type VideoItem = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  news_id: number | null;
  created_at: string;
};
export type PictureItem = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  news_id: number | null;
  created_at: string;
};

/** A gallery "folder" — an event (news post) with its media, or general media. */
export type GalleryFolder = {
  key: string;
  title: string;
  date: string | null;
  pictures: PictureItem[];
  videos: VideoItem[];
};

export type NewsDetail = NewsItem & {
  pictures: PictureItem[];
  videos: VideoItem[];
};
export type TeamMemberItem = {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  photo_url: string | null;
  is_partner: boolean;
  experience: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type PublicContent = {
  latestNews: NewsItem | null;
  news: NewsItem[];
  videos: VideoItem[];
  pictures: PictureItem[];
  team: TeamMemberItem[];
};

export async function getPublicContent(): Promise<PublicContent> {
  try {
    await ensureSchema();
    const [news, videos, pictures, team] = await Promise.all([
      sql`SELECT id, title, body, image_url, event_date, created_at FROM news
          WHERE published = TRUE ORDER BY COALESCE(event_date, created_at) DESC LIMIT 12`,
      sql`SELECT id, title, url, description, news_id, created_at FROM videos
          WHERE published = TRUE ORDER BY created_at DESC LIMIT 24`,
      sql`SELECT id, title, url, description, news_id, created_at FROM pictures
          WHERE published = TRUE ORDER BY created_at DESC LIMIT 24`,
      sql`SELECT id, name, role, company, photo_url, is_partner,
                 experience, phone, email, created_at
          FROM team_members WHERE published = TRUE
          ORDER BY is_partner DESC, created_at ASC LIMIT 50`,
    ]);
    const newsList = news as unknown as NewsItem[];
    return {
      latestNews: newsList[0] ?? null,
      news: newsList,
      videos: videos as unknown as VideoItem[],
      pictures: pictures as unknown as PictureItem[],
      team: team as unknown as TeamMemberItem[],
    };
  } catch (err) {
    console.error("getPublicContent error", err);
    return { latestNews: null, news: [], videos: [], pictures: [], team: [] };
  }
}

export async function getNewsById(id: number): Promise<NewsItem | null> {
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, title, body, image_url, event_date, created_at FROM news
      WHERE id = ${id} AND published = TRUE LIMIT 1
    `) as unknown as NewsItem[];
    return rows[0] ?? null;
  } catch (err) {
    console.error("getNewsById error", err);
    return null;
  }
}

/** A single news event with all its attached (published) media. */
export async function getNewsDetail(id: number): Promise<NewsDetail | null> {
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, title, body, image_url, event_date, created_at FROM news
      WHERE id = ${id} AND published = TRUE LIMIT 1
    `) as unknown as NewsItem[];
    const item = rows[0];
    if (!item) return null;
    const [pics, vids] = await Promise.all([
      sql`SELECT id, title, url, description, news_id, created_at FROM pictures
          WHERE news_id = ${id} AND published = TRUE ORDER BY created_at ASC`,
      sql`SELECT id, title, url, description, news_id, created_at FROM videos
          WHERE news_id = ${id} AND published = TRUE ORDER BY created_at ASC`,
    ]);
    return {
      ...item,
      pictures: pics as unknown as PictureItem[],
      videos: vids as unknown as VideoItem[],
    };
  } catch (err) {
    console.error("getNewsDetail error", err);
    return null;
  }
}

/**
 * Gallery folders. Media attached to a news event surfaces here only once the
 * event is at least 7 days old (computed on read — no scheduled job). Media not
 * attached to any event is always shown under a general folder.
 */
export async function getGallery(): Promise<GalleryFolder[]> {
  try {
    await ensureSchema();
    const [events, pics, vids] = await Promise.all([
      sql`SELECT id, title, COALESCE(event_date, created_at) AS date FROM news
          WHERE published = TRUE
            AND COALESCE(event_date, created_at) <= NOW() - INTERVAL '7 days'
          ORDER BY COALESCE(event_date, created_at) DESC`,
      sql`SELECT id, title, url, description, news_id, created_at FROM pictures
          WHERE published = TRUE ORDER BY created_at DESC`,
      sql`SELECT id, title, url, description, news_id, created_at FROM videos
          WHERE published = TRUE ORDER BY created_at DESC`,
    ]);
    const pictures = pics as unknown as PictureItem[];
    const videos = vids as unknown as VideoItem[];
    const eventRows = events as unknown as { id: number; title: string; date: string }[];

    const folders: GalleryFolder[] = [];
    for (const ev of eventRows) {
      const fp = pictures.filter((p) => Number(p.news_id) === ev.id);
      const fv = videos.filter((v) => Number(v.news_id) === ev.id);
      if (fp.length === 0 && fv.length === 0) continue;
      folders.push({ key: `e${ev.id}`, title: ev.title, date: ev.date, pictures: fp, videos: fv });
    }
    // Unattached media — always visible.
    const gp = pictures.filter((p) => p.news_id == null);
    const gv = videos.filter((v) => v.news_id == null);
    if (gp.length > 0 || gv.length > 0) {
      folders.push({ key: "general", title: "", date: null, pictures: gp, videos: gv });
    }
    return folders;
  } catch (err) {
    console.error("getGallery error", err);
    return [];
  }
}
