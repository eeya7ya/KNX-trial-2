import type { Locale } from "./i18n";

/* The club's events calendar — workshops, meetups, and the yearly conference
   shown on /events and in the homepage Events section. Rows live in the
   `calendar_events` table and are managed from /admin/content/calendar_events.
   This module holds only what both the server and the admin form need: the
   shapes, the validators, and the formatting. The queries live in lib/db.ts. */

export const EVENT_KINDS = ["workshop", "meetup", "conference"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export function isEventKind(value: unknown): value is EventKind {
  return (EVENT_KINDS as readonly unknown[]).includes(value);
}

export type CalendarEvent = {
  id: number;
  kind: EventKind;
  title: string;
  subtitle: string | null;
  /** Bare calendar day, YYYY-MM-DD, in Amman time. */
  event_date: string;
  /** 24-hour HH:MM, Amman time. */
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  presenter_name: string | null;
  presenter_role: string | null;
  presenter_bio: string | null;
  presenter_photo_url: string | null;
  register_url: string | null;
};

export type EventStatus = "upcoming" | "today" | "past";

/** An event with its date and time already formatted for one locale. */
export type EventCard = CalendarEvent & {
  status: EventStatus;
  day: string;
  month: string;
  dateLabel: string;
  /** "6:00 PM – 9:00 PM", or just the start when no end is set. */
  timeLabel: string | null;
  /** "6:00 PM" — for the homepage cards, where the full range wraps. */
  startLabel: string | null;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** True for a real calendar day written as YYYY-MM-DD. */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) return false;
  // Rejects 2026-02-31 and friends, which Date quietly rolls into March.
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** True for a 24-hour HH:MM time, the value an <input type="time"> sends. */
export function isClockTime(value: unknown): value is string {
  return typeof value === "string" && CLOCK_RE.test(value);
}

/** Today's date in Amman, YYYY-MM-DD — the day the club's calendar runs on. */
export function ammanToday(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman" }).format(now);
}

/**
 * Format events for a locale and mark each upcoming / today / past. Done on
 * the server so the client never re-formats them: event_date is a bare day,
 * so it is read in UTC, where it cannot slide into the day before.
 */
export function toEventCards(
  events: CalendarEvent[],
  locale: Locale,
  today: string = ammanToday(),
): EventCard[] {
  const dateLocale = locale === "ar" ? "ar-JO" : "en-GB";
  const timeLocale = locale === "ar" ? "ar-JO" : "en-US";
  const fmt = (opts: Intl.DateTimeFormatOptions, loc = dateLocale) =>
    new Intl.DateTimeFormat(loc, { timeZone: "UTC", ...opts });
  const dayFmt = fmt({ day: "numeric" });
  const monthFmt = fmt({ month: "short" });
  const fullFmt = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeFmt = fmt({ hour: "numeric", minute: "2-digit", hour12: true }, timeLocale);
  const clock = (t: string) => timeFmt.format(new Date(`1970-01-01T${t}:00Z`));

  return events.map((e) => {
    const date = new Date(`${e.event_date}T00:00:00Z`);
    const status: EventStatus =
      e.event_date < today ? "past" : e.event_date === today ? "today" : "upcoming";
    const startLabel = e.start_time ? clock(e.start_time) : null;
    const timeLabel =
      startLabel && e.end_time ? `${startLabel} – ${clock(e.end_time)}` : startLabel;
    return {
      ...e,
      status,
      day: dayFmt.format(date),
      month: monthFmt.format(date),
      dateLabel: fullFmt.format(date),
      timeLabel,
      startLabel,
    };
  });
}

/**
 * The first round of workshops, written into `calendar_events` once, the
 * first time the table is created (see ensureSchema). After that the admin
 * panel owns the rows: editing or deleting one never brings it back.
 */
export const SEED_EVENTS: Omit<CalendarEvent, "id">[] = [
  {
    kind: "workshop",
    title: "Introduction To KNX",
    subtitle: "Basics, System Architecture and Practical Applications",
    event_date: "2026-10-10",
    start_time: "18:00",
    end_time: "21:00",
    location: null,
    presenter_name: "Eng. Mohammad Abu Alhaj",
    presenter_role: "KNX Tutor | Head of KNX User Club Jordan",
    presenter_bio:
      "Certified KNX Tutor and Head of KNX User Club Jordan, specialized in lighting control systems, with extensive experience in KNX-based building automation and smart lighting solutions.",
    presenter_photo_url: "/events/mohammad-abu-alhaj.jpg",
    register_url: null,
  },
  {
    kind: "workshop",
    title: "DALI System and Integration with KNX",
    subtitle: "System Overview, Integration, Configuration and Practical Applications",
    event_date: "2026-10-12",
    start_time: "18:00",
    end_time: "21:00",
    location: null,
    presenter_name: "Eng. Mohammad Abu Alhaj",
    presenter_role: "KNX Tutor | Head of KNX User Club Jordan",
    presenter_bio:
      "Certified KNX Tutor and Head of KNX User Club Jordan, specialized in lighting control systems, with extensive experience in KNX-based building automation and smart lighting solutions.",
    presenter_photo_url: "/events/mohammad-abu-alhaj.jpg",
    register_url: null,
  },
  {
    kind: "workshop",
    title: "HVAC Systems Integration with KNX",
    subtitle: "Design, Control and Practical Implementation",
    event_date: "2026-10-20",
    start_time: "18:00",
    end_time: "21:00",
    location: null,
    presenter_name: "Diaa Aldeen Karajah",
    presenter_role: "HVAC Systems Specialist & KNX Tutor",
    presenter_bio:
      "Experienced in HVAC systems and KNX-based building automation, with practical expertise in smart building control and system integration.",
    presenter_photo_url: "/events/diaa-aldeen-karajah.jpg",
    register_url: null,
  },
  {
    kind: "workshop",
    title: "Solar Energy and Integration with KNX",
    subtitle: "Design, Control and Practical Applications",
    event_date: "2026-10-24",
    start_time: "18:00",
    end_time: "21:00",
    location: null,
    presenter_name: "Eng. Ahmed Al-Hariri",
    presenter_role: "KNX Tutor | Head of KNX User Club Iraq",
    presenter_bio:
      "Head of KNX User Club Iraq and certified KNX Tutor, with extensive experience in solar energy systems and their integration with KNX for smart and sustainable building solutions.",
    presenter_photo_url: "/events/ahmed-al-hariri.jpg",
    register_url: null,
  },
  {
    kind: "workshop",
    title: "KNX in Electrical Design",
    subtitle: "Design principles, system planning and practical integration in electrical projects.",
    event_date: "2026-10-29",
    start_time: "18:00",
    end_time: "21:00",
    location: null,
    presenter_name: "Eng. Ahmad Jallad",
    presenter_role: "Senior Electrical Designer",
    presenter_bio:
      "Senior Electrical Designer with over 18 years of experience in building services design and lighting control.",
    presenter_photo_url: "/events/ahmad-jallad.jpg",
    register_url: null,
  },
];
