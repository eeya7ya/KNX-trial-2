/* --- The booking window -------------------------------------------------
   Everything the temporary /WebinarsAssign page offers lives between these
   two days, inclusive. They are the only thing to edit when the club opens a
   new round: the calendar, the "available dates" badge, and the server-side
   validation all read from here, so a day outside the window can neither be
   drawn as pickable nor accepted by the API. */
export const WINDOW_FIRST = "2026-09-20";
export const WINDOW_LAST = "2026-10-30";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** True for a real calendar day that falls inside the booking window. */
export function isBookableDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  if (value < WINDOW_FIRST || value > WINDOW_LAST) return false;
  // Rejects the shapes the regex lets through — 2026-02-31, 2026-13-01 — by
  // round-tripping through Date, which normalises them to another day.
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export type MonthDef = {
  /** 1-based month number, e.g. 9 for September. */
  month: number;
  year: number;
  /** Days in the month. */
  days: number;
  /** Weekday of the 1st, 0 = Sunday — how many blank cells the grid starts with. */
  firstDow: number;
};

/** The months the window spans, in order, each with the shape its grid needs. */
export function monthsInWindow(): MonthDef[] {
  const [fy, fm] = WINDOW_FIRST.split("-").map(Number);
  const [ly, lm] = WINDOW_LAST.split("-").map(Number);
  const out: MonthDef[] = [];
  let year = fy;
  let month = fm;
  while (year < ly || (year === ly && month <= lm)) {
    out.push({
      month,
      year,
      days: new Date(Date.UTC(year, month, 0)).getUTCDate(),
      firstDow: new Date(Date.UTC(year, month - 1, 1)).getUTCDay(),
    });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}
