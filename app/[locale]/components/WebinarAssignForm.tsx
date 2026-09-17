"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  formatWindowDate,
  getWebinarAssignCopy,
  type WebinarAssignCopy,
} from "@/lib/webinar-assign-copy";
import {
  isoDate,
  monthsInWindow,
  WINDOW_FIRST,
  WINDOW_LAST,
} from "@/lib/webinars";

type Status = "idle" | "submitting" | "success" | "error";
type CellKind = "blank" | "out" | "taken" | "free" | "picked";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];

const CELL_BASE =
  "flex h-11 items-center justify-center rounded-[10px] text-sm font-semibold";

const CELL_STYLE: Record<CellKind, string> = {
  blank: "invisible",
  out: "cursor-not-allowed border border-dashed border-line text-ink-muted",
  taken:
    "cursor-not-allowed border border-line bg-subtle text-ink-muted line-through",
  free: "cursor-pointer border border-line bg-card text-ink transition hover:border-accent hover:bg-accent-soft",
  picked: "cursor-pointer border border-cta bg-cta text-cta-ink",
};

export function WebinarAssignForm({
  locale,
  initialTaken,
}: {
  locale: Locale;
  initialTaken: string[];
}) {
  const copy = getWebinarAssignCopy(locale);
  const [taken, setTaken] = useState<string[]>(initialTaken);
  const [picked, setPicked] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const months = useMemo(() => monthsInWindow(), []);
  const takenSet = useMemo(() => new Set(taken), [taken]);

  // The circular well the design draws is where the chosen photo belongs, so
  // it previews locally — nothing is sent until the form is submitted.
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const done = status === "success";

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!PHOTO_TYPES.includes(file.type)) {
      setStatus("error");
      setMessage(copy.photoWrongType);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setStatus("error");
      setMessage(copy.photoTooBig);
      e.target.value = "";
      return;
    }
    setPhoto(file);
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  function clearPhoto() {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (done) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const title = String(data.get("title") ?? "").trim();

    if (name.length < 2) return fail(copy.needName);
    if (title.length < 3) return fail(copy.needTitle);
    if (!picked) return fail(copy.needDate);

    setStatus("submitting");
    setMessage("");

    const payload = new FormData();
    payload.set("name", name);
    payload.set("experience", String(data.get("experience") ?? "").trim());
    payload.set("title", title);
    payload.set("date", picked);
    payload.set("locale", locale);
    if (photo) payload.set("photo", photo);

    try {
      const res = await fetch("/api/webinars-assign", { method: "POST", body: payload });
      const body = (await res.json()) as {
        ok?: boolean;
        code?: string;
        taken?: string[];
        photoStored?: boolean;
      };

      if (Array.isArray(body.taken)) setTaken(body.taken);

      if (!res.ok || !body.ok) {
        // The day went to someone else between the page load and the submit:
        // it is grey now, so drop the selection and let them pick again.
        if (body.code === "taken") {
          setPicked(null);
          return fail(copy.conflict);
        }
        if (body.code === "name") return fail(copy.needName);
        if (body.code === "title") return fail(copy.needTitle);
        if (body.code === "date") return fail(copy.needDate);
        if (body.code === "photoType") return fail(copy.photoWrongType);
        if (body.code === "photoSize") return fail(copy.photoTooBig);
        return fail(copy.serverError);
      }

      setStatus("success");
      setMessage(body.photoStored === false ? copy.photoFailed : copy.success);
    } catch {
      fail(copy.networkError);
    }
  }

  function fail(text: string) {
    setStatus("error");
    setMessage(text);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 md:gap-7">
      <Section title={copy.s1} hint={copy.s1hint}>
        <div>
          <label htmlFor="pname" className="mb-2 block text-sm font-semibold text-ink">
            {copy.name}
          </label>
          <input
            type="text"
            id="pname"
            name="name"
            required
            maxLength={120}
            disabled={done}
            placeholder={copy.namePh}
            className="h-13 w-full rounded-xl border border-line bg-card px-4 text-base text-ink outline-none transition placeholder:text-ink-muted focus:border-accent disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="pexp" className="mb-2 block text-sm font-semibold text-ink">
            {copy.exp}
          </label>
          <textarea
            id="pexp"
            name="experience"
            rows={4}
            maxLength={2000}
            disabled={done}
            placeholder={copy.expPh}
            className="w-full resize-none rounded-xl border border-line bg-card px-4 py-3.5 text-base leading-relaxed text-ink outline-none transition placeholder:text-ink-muted focus:border-accent disabled:opacity-60"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-ink">{copy.photo}</span>
          <div className="flex flex-col items-start gap-5 rounded-xl border border-dashed border-line bg-subtle p-5 sm:flex-row sm:items-center">
            <span className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-card">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  data-no-dim
                  className="h-full w-full object-cover"
                />
              ) : (
                <IconUpload />
              )}
            </span>
            <div className="flex flex-grow flex-col items-start gap-2.5">
              <p className="text-[13px] leading-relaxed text-ink-muted">
                {photo ? photo.name : copy.photoHint}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  id="pphoto"
                  name="photo"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={done}
                  onChange={onPhotoChange}
                  className="sr-only"
                />
                <label
                  htmlFor="pphoto"
                  className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line bg-card px-5 text-sm font-semibold text-ink transition hover:border-accent"
                >
                  {photo ? copy.change : copy.choose}
                </label>
                {photo && !done && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="inline-flex h-11 items-center rounded-full px-3 text-sm font-semibold text-accent transition hover:text-accent-strong"
                  >
                    {copy.remove}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title={copy.s2} hint={copy.s2hint}>
        <div>
          <label htmlFor="ptitle" className="mb-2 block text-sm font-semibold text-ink">
            {copy.webinar}
          </label>
          <input
            type="text"
            id="ptitle"
            name="title"
            required
            maxLength={200}
            disabled={done}
            placeholder={copy.webinarPh}
            className="h-13 w-full rounded-xl border border-line bg-card px-4 text-base text-ink outline-none transition placeholder:text-ink-muted focus:border-accent disabled:opacity-60"
          />
        </div>
      </Section>

      <Section title={copy.s3} hint={copy.s3hint}>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Legend swatch="border border-line bg-card" label={copy.legFree} />
          <Legend swatch="border border-line bg-subtle" label={copy.legTaken} />
          <Legend swatch="border border-cta bg-cta" label={copy.legPick} />
          <Legend swatch="border border-dashed border-line" label={copy.legOut} />
        </div>

        <div className="flex flex-col gap-7 sm:flex-row sm:gap-8">
          {months.map((m) => {
            const cells: { key: string; kind: CellKind; day: string; label: string }[] = [];
            for (let b = 0; b < m.firstDow; b++) {
              cells.push({ key: `${m.year}-${m.month}-b${b}`, kind: "blank", day: "", label: "" });
            }
            for (let day = 1; day <= m.days; day++) {
              const iso = isoDate(m.year, m.month, day);
              const dow = (m.firstDow + day - 1) % 7;
              const human = `${copy.dayNames[dow]} ${day} ${copy.monthNames[m.month - 1]} ${m.year}`;
              let kind: CellKind = "free";
              if (iso < WINDOW_FIRST || iso > WINDOW_LAST) kind = "out";
              else if (takenSet.has(iso)) kind = "taken";
              if (kind === "free" && picked === iso) kind = "picked";
              const locked = kind === "out" || kind === "taken";
              cells.push({
                key: iso,
                kind,
                day: String(day),
                label: locked
                  ? `${human} — ${kind === "out" ? copy.out : copy.taken}`
                  : human,
              });
            }

            return (
              <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col gap-3">
                <h3 className="text-base font-semibold text-ink">
                  {copy.monthNames[m.month - 1]} {m.year}
                </h3>
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {copy.dowShort.map((d, i) => (
                    <div
                      key={`${m.month}-d${i}`}
                      className="flex h-[22px] items-center justify-center text-[11px] font-semibold text-ink-muted"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {cells.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      disabled={c.kind === "blank" || c.kind === "out" || c.kind === "taken" || done}
                      aria-label={c.label}
                      aria-pressed={c.kind === "picked"}
                      onClick={() => setPicked(picked === c.key ? null : c.key)}
                      className={`${CELL_BASE} ${CELL_STYLE[c.kind]}`}
                    >
                      {c.day}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 ${
            picked ? "border-accent bg-accent-soft" : "border-line bg-subtle"
          }`}
        >
          <span
            className={`flex-grow text-[15px] font-semibold ${
              picked ? "text-accent" : "text-ink-muted"
            }`}
          >
            {picked ? copy.slot + humanDate(picked, copy) : copy.empty}
          </span>
          {picked && !done && (
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="h-9 rounded-full border border-line bg-card px-4 text-[13px] font-semibold text-accent transition hover:text-accent-strong"
            >
              {copy.change}
            </button>
          )}
        </div>
      </Section>

      <div className="flex flex-col items-stretch gap-3 sm:items-start">
        {!done && (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="h-14 rounded-full bg-cta px-8 text-base font-semibold text-cta-ink transition hover:bg-cta-hover disabled:opacity-60 sm:w-auto"
          >
            {status === "submitting" ? copy.submitting : copy.submit}
          </button>
        )}
        {status === "error" && <p className="text-sm font-semibold text-danger">{message}</p>}
        {done && (
          <p className="rounded-xl border border-accent bg-accent-soft px-5 py-4 text-[15px] font-semibold text-accent">
            {message}
          </p>
        )}
        {!done && (
          <p className="text-[13px] leading-relaxed text-ink-muted">{copy.foot}</p>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-line bg-card p-5 md:p-10">
      <div>
        <h2 className="text-[22px] font-bold text-ink">{title}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-ink-muted">
      <span className={`inline-block h-4 w-4 shrink-0 rounded-[5px] ${swatch}`} />
      {label}
    </span>
  );
}

function humanDate(iso: string, copy: WebinarAssignCopy): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${copy.dayNames[dow]} ${formatWindowDate(iso, copy)}`;
}

function IconUpload() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-accent"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}
