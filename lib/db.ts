import { neon } from "@neondatabase/serverless";
import {
  isClockTime,
  isEventKind,
  isIsoDate,
  SEED_EVENTS,
  type CalendarEvent,
} from "./events";

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
    // Contact number from the join form (added later — keep idempotent).
    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS phone TEXT`;
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
    // Manual display order for team members (added later — keep idempotent).
    await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS sort_order INTEGER`;
    // One-time backfill: seed the order from the previous default (partners
    // first, then oldest first) so nothing visibly jumps. No-op once any row
    // has an explicit order, so admin reordering is never overwritten.
    await sql`
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY is_partner DESC, created_at ASC) AS rn
        FROM team_members
      )
      UPDATE team_members t SET sort_order = ordered.rn
      FROM ordered
      WHERE t.id = ordered.id
        AND NOT EXISTS (SELECT 1 FROM team_members WHERE sort_order IS NOT NULL)
    `;
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
    // The events calendar on /events — workshops, meetups, the conference.
    // event_date is a bare Amman day and the times are HH:MM text, so neither
    // can drift with the server's time zone on the way in or out.
    await sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id                  BIGSERIAL PRIMARY KEY,
        kind                TEXT NOT NULL DEFAULT 'workshop',
        title               TEXT NOT NULL,
        subtitle            TEXT,
        event_date          DATE NOT NULL,
        start_time          TEXT,
        end_time            TEXT,
        location            TEXT,
        presenter_name      TEXT,
        presenter_role      TEXT,
        presenter_bio       TEXT,
        presenter_photo_url TEXT,
        register_url        TEXT,
        published           BOOLEAN NOT NULL DEFAULT TRUE,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // One-time seed with the first round of workshops. The site_settings flag
    // is claimed in the same statement, so the seed runs exactly once per
    // database — not "whenever the table is empty", which would resurrect the
    // rows the day an admin deletes the last of them.
    await sql`
      WITH first_run AS (
        INSERT INTO site_settings (key, value)
        VALUES ('calendar_events_seeded', 'true'::jsonb)
        ON CONFLICT (key) DO NOTHING
        RETURNING key
      )
      INSERT INTO calendar_events
        (kind, title, subtitle, event_date, start_time, end_time, location,
         presenter_name, presenter_role, presenter_bio, presenter_photo_url, register_url)
      SELECT s.kind, s.title, s.subtitle, s.event_date::date, s.start_time, s.end_time,
             s.location, s.presenter_name, s.presenter_role, s.presenter_bio,
             s.presenter_photo_url, s.register_url
      FROM jsonb_to_recordset(${JSON.stringify(SEED_EVENTS)}::jsonb) AS s(
        kind TEXT, title TEXT, subtitle TEXT, event_date TEXT, start_time TEXT,
        end_time TEXT, location TEXT, presenter_name TEXT, presenter_role TEXT,
        presenter_bio TEXT, presenter_photo_url TEXT, register_url TEXT
      )
      WHERE EXISTS (SELECT 1 FROM first_run)
    `;
    // One-time fix for databases seeded before the Solar Energy workshop moved
    // from 20 to 24 October 2026. It touches the row only while it still holds
    // the seeded date, and claims its own flag, so it runs once and never undoes
    // a later admin edit. A database seeded after the move matches nothing.
    await sql`
      WITH first_run AS (
        INSERT INTO site_settings (key, value)
        VALUES ('calendar_events_solar_moved_to_24', 'true'::jsonb)
        ON CONFLICT (key) DO NOTHING
        RETURNING key
      )
      UPDATE calendar_events SET event_date = '2026-10-24'
      WHERE title = 'Solar Energy and Integration with KNX'
        AND event_date = '2026-10-20'
        AND EXISTS (SELECT 1 FROM first_run)
    `;
    // Log of one-off emails sent from the admin composer.
    await sql`
      CREATE TABLE IF NOT EXISTS emails_sent (
        id          BIGSERIAL PRIMARY KEY,
        to_email    TEXT NOT NULL,
        subject     TEXT,
        body        TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'sent',
        error       TEXT,
        provider_id TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Proceed / Cancel responses from recipients of welcome emails.
    await sql`
      CREATE TABLE IF NOT EXISTS join_responses (
        id          BIGSERIAL PRIMARY KEY,
        name        TEXT,
        email       TEXT NOT NULL,
        action      TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Presenter submissions from the temporary /WebinarsAssign page. One
    // presenter per day: the UNIQUE on slot_date is what actually closes a day
    // to everyone else — the greyed-out cells in the picker are only the UI
    // telling the same story, so two people submitting the same day at the
    // same moment still end with exactly one booking.
    await sql`
      CREATE TABLE IF NOT EXISTS webinar_assignments (
        id            BIGSERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        experience    TEXT,
        photo_url     TEXT,
        webinar_title TEXT NOT NULL,
        slot_date     DATE NOT NULL UNIQUE,
        locale        TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

export const CONTENT_TABLES = [
  "news",
  "videos",
  "pictures",
  "prompts",
  "team_members",
  "calendar_events",
] as const;
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
  calendar_events: [
    "kind",
    "title",
    "subtitle",
    "event_date",
    "start_time",
    "end_time",
    "location",
    "presenter_name",
    "presenter_role",
    "presenter_bio",
    "presenter_photo_url",
    "register_url",
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
  // The type picker's blank option means the default, not "no type".
  if (table === "calendar_events" && !isEventKind(out.kind)) out.kind = "workshop";
  return out;
}

/**
 * Checks a picked row against the rules its columns can't enforce. Returns a
 * message for the admin form, or null when the row can be written.
 */
export function contentFieldError(
  table: ContentTable,
  data: Record<string, unknown>,
): string | null {
  if (table !== "calendar_events") return null;
  if (!data.title) return "Title is required.";
  if (!isIsoDate(data.event_date)) return "Event date must be a real day (YYYY-MM-DD).";
  if (data.start_time != null && !isClockTime(data.start_time))
    return "Start time must be HH:MM.";
  if (data.end_time != null && !isClockTime(data.end_time))
    return "End time must be HH:MM.";
  return null;
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
          ORDER BY sort_order ASC NULLS LAST, created_at ASC LIMIT 50`,
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

/**
 * Every published calendar event, earliest first. The page splits them into
 * upcoming and past itself, so the cut-over at midnight needs no job.
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    await ensureSchema();
    return (await sql`
      SELECT id, kind, title, subtitle, to_char(event_date, 'YYYY-MM-DD') AS event_date,
             start_time, end_time, location, presenter_name, presenter_role,
             presenter_bio, presenter_photo_url, register_url
      FROM calendar_events WHERE published = TRUE
      ORDER BY calendar_events.event_date ASC, start_time ASC NULLS LAST, id ASC LIMIT 200
    `) as unknown as CalendarEvent[];
  } catch (err) {
    console.error("getCalendarEvents error", err);
    return [];
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
