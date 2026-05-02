# KNX Club Jordan

Simple website for the Jordanian KNX Club. Built with Next.js 15 (App Router) +
React 19 + Tailwind CSS v4, with a Neon serverless Postgres backend for
membership signups. Designed to deploy on Vercel.

## Stack

- Next.js 15 (App Router, Edge runtime API)
- React 19
- Tailwind CSS v4 (CSS-first config via `@theme`)
- `@neondatabase/serverless` (HTTP driver, edge-compatible)
- TypeScript 5

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL from Neon
npm run dev
```

Open http://localhost:3000.

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

1. Create a Neon project, copy the pooled connection string.
2. Push this repo to GitHub and import into Vercel.
3. Add `DATABASE_URL` to the Vercel project's environment variables.
4. Deploy. The `/api/join` route runs on the Edge runtime and uses Neon's HTTP
   driver, so it works with Vercel serverless/edge out of the box.

## Branding

The included `Logo` component is a stylised placeholder using the KNX green
(`#00965e`). Drop the official KNX wordmark SVG into `app/components/Logo.tsx`
(or replace with `<img>` / `next/image`) when you have the licensed asset.
