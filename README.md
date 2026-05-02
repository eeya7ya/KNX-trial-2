# KNX Club Jordan — نادي KNX الأردني

Bilingual (Arabic-default, English-switchable) website for the Jordanian KNX
Club. Built with Next.js 15 (App Router) + React 19 + Tailwind CSS v4, with a
Neon serverless Postgres backend for membership signups. Designed to deploy on
Vercel.

## Stack

- Next.js 15 (App Router, dynamic `[locale]` segment, Edge API)
- React 19
- Tailwind CSS v4 (CSS-first config via `@theme`, `rtl:` variants)
- `next/font` (Cairo for Arabic, Inter for English)
- `@neondatabase/serverless` (HTTP driver, edge-compatible)
- TypeScript 5

## i18n

- `/` → rewrites to `/ar` (Arabic, RTL) — default
- `/en` → English, LTR
- Language switcher in the header toggles between the two
- Strings live in `lib/i18n.ts`

## Logo

Drop your official KNX logo at `public/knx-logo.svg`. It is referenced by:

- `app/[locale]/components/Logo.tsx`
- favicon (`icons.icon` in metadata)

A neutral placeholder is committed; replace it in place with the real asset.

## Local development

```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL from Neon
npm run dev
```

Open http://localhost:3000 (auto-redirects to `/ar`).

## Database

The signup API auto-creates the `members` table on first call:

```sql
CREATE TABLE IF NOT EXISTS members (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Deploy to Vercel

1. Create a Neon project and copy the pooled connection string.
2. Push this repo and import it into Vercel.
3. Add `DATABASE_URL` in Project → Settings → Environment Variables.
4. Deploy. `/api/join` runs on the Edge runtime via Neon's HTTP driver.
