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

export type NewsItem = {
  id: number;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
};
export type VideoItem = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};
export type PictureItem = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};
export type TeamMemberItem = {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  photo_url: string | null;
  is_partner: boolean;
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
      sql`SELECT id, title, body, image_url, created_at FROM news
          WHERE published = TRUE ORDER BY created_at DESC LIMIT 12`,
      sql`SELECT id, title, url, description, created_at FROM videos
          WHERE published = TRUE ORDER BY created_at DESC LIMIT 24`,
      sql`SELECT id, title, url, description, created_at FROM pictures
          WHERE published = TRUE ORDER BY created_at DESC LIMIT 24`,
      sql`SELECT id, name, role, company, photo_url, is_partner, created_at
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
      SELECT id, title, body, image_url, created_at FROM news
      WHERE id = ${id} AND published = TRUE LIMIT 1
    `) as unknown as NewsItem[];
    return rows[0] ?? null;
  } catch (err) {
    console.error("getNewsById error", err);
    return null;
  }
}
