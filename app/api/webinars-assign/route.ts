import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isBookableDate, WINDOW_FIRST, WINDOW_LAST } from "@/lib/webinars";
import { getTakenDates } from "@/lib/webinars-db";
import { isR2Configured, uploadToR2 } from "@/lib/r2";

// The photo arrives as multipart and goes to R2 through the AWS SDK, neither of
// which belongs on the edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

/** The days already spoken for — what the picker greys out. */
export async function GET() {
  const taken = await getTakenDates();
  return NextResponse.json(
    { ok: true, taken, first: WINDOW_FIRST, last: WINDOW_LAST },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const str = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const name = str("name");
  const experience = str("experience");
  const title = str("title");
  const date = str("date");
  const locale = str("locale") === "en" ? "en" : "ar";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ ok: false, code: "name" }, { status: 400 });
  }
  if (experience.length > 2000) {
    return NextResponse.json({ ok: false, code: "experience" }, { status: 400 });
  }
  if (title.length < 3 || title.length > 200) {
    return NextResponse.json({ ok: false, code: "title" }, { status: 400 });
  }
  if (!isBookableDate(date)) {
    return NextResponse.json({ ok: false, code: "date" }, { status: 400 });
  }

  const photo = form.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto) {
    if (!PHOTO_TYPES.has(photo.type)) {
      return NextResponse.json({ ok: false, code: "photoType" }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ ok: false, code: "photoSize" }, { status: 413 });
    }
  }

  try {
    await ensureSchema();

    // The booking is claimed before the photo is uploaded, so a slow upload can
    // never widen the window in which two people both believe they hold the
    // day. DO NOTHING + an empty RETURNING is the race losing cleanly: the
    // UNIQUE on slot_date decides, not the picker the visitor was looking at.
    const inserted = (await sql`
      INSERT INTO webinar_assignments (name, experience, webinar_title, slot_date, locale)
      VALUES (${name}, ${experience || null}, ${title}, ${date}::date, ${locale})
      ON CONFLICT (slot_date) DO NOTHING
      RETURNING id
    `) as { id: number }[];

    if (inserted.length === 0) {
      // Someone else got there first — hand back the refreshed list so the
      // picker can grey the day out instead of offering it again.
      return NextResponse.json(
        { ok: false, code: "taken", taken: await getTakenDates() },
        { status: 409 },
      );
    }

    const id = inserted[0].id;
    let photoStored = true;

    if (hasPhoto && isR2Configured()) {
      try {
        const { url } = await uploadToR2({
          kind: "image",
          filename: photo.name || "presenter.jpg",
          contentType: photo.type,
          body: new Uint8Array(await photo.arrayBuffer()),
        });
        await sql`UPDATE webinar_assignments SET photo_url = ${url} WHERE id = ${id}`;
      } catch (err) {
        // The slot is the thing that had to be atomic; a lost photo is a
        // follow-up email, not a reason to throw the booking away.
        console.error("webinar assignment photo upload failed", err);
        photoStored = false;
      }
    } else if (hasPhoto) {
      console.warn("webinar assignment photo dropped: R2 is not configured");
      photoStored = false;
    }

    return NextResponse.json({ ok: true, id, photoStored, taken: await getTakenDates() });
  } catch (err) {
    console.error("webinar assignment error", err);
    return NextResponse.json({ ok: false, code: "server" }, { status: 500 });
  }
}
