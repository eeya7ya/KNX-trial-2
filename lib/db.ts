import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id          BIGSERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      role        TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
