"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type UploadKind = "image" | "video" | "file";
type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "checkbox" | "datetime" | "select";
  required?: boolean;
  upload?: { kind: UploadKind; accept: string };
  options?: { value: string; label: string }[];
};

// Format a stored timestamp into the value a datetime-local input expects.
function toLocalInput(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
type Row = {
  id: number;
  title: string;
  created_at: string;
  published: boolean;
  [k: string]: unknown;
};

export function ContentManager({
  table,
  fields,
  initialRows,
}: {
  table: string;
  fields: Field[];
  initialRows: Row[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [bools, setBools] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(fields.filter((f) => f.type === "checkbox").map((f) => [f.name, false])),
  );
  const [published, setPublished] = useState(true);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function reset() {
    setEditingId(null);
    setValues(Object.fromEntries(fields.map((f) => [f.name, ""])));
    setBools(
      Object.fromEntries(fields.filter((f) => f.type === "checkbox").map((f) => [f.name, false])),
    );
    setPublished(true);
    setUploadProgress({});
    setErr("");
  }

  function startEdit(row: Row) {
    setEditingId(row.id);
    setValues(
      Object.fromEntries(
        fields
          .filter((f) => f.type !== "checkbox")
          .map((f) => {
            const raw = row[f.name] == null ? "" : String(row[f.name]);
            return [f.name, f.type === "datetime" && raw ? toLocalInput(raw) : raw];
          }),
      ),
    );
    setBools(
      Object.fromEntries(
        fields.filter((f) => f.type === "checkbox").map((f) => [f.name, Boolean(row[f.name])]),
      ),
    );
    setPublished(Boolean(row.published));
    setUploadProgress({});
    setErr("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleUpload(field: Field, file: File) {
    if (!field.upload) return;
    setUploadingField(field.name);
    setErr("");
    setUploadProgress((p) => ({ ...p, [field.name]: 0 }));
    try {
      const url = await uploadWithProgress(file, field.upload.kind, (pct) =>
        setUploadProgress((p) => ({ ...p, [field.name]: pct })),
      );
      setValues((v) => ({ ...v, [field.name]: url }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingField(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const url =
        editingId == null
          ? `/api/admin/content/${table}`
          : `/api/admin/content/${table}/${editingId}`;
      const res = await fetch(url, {
        method: editingId == null ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...bools, published }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setErr(body.error || "Failed to save");
        return;
      }
      reset();
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this entry?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/content/${table}/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[420px_1fr]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold">{editingId == null ? "Add new" : "Edit entry"}</p>
        <div className="mt-4 grid gap-4">
          {fields.map((f) => (
            <label key={f.name} className="block">
              {f.type !== "checkbox" && (
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                </span>
              )}
              {f.type === "checkbox" ? (
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={bools[f.name] ?? false}
                    onChange={(e) =>
                      setBools((b) => ({ ...b, [f.name]: e.target.checked }))
                    }
                  />
                  {f.label}
                </span>
              ) : f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  rows={4}
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx"
                />
              ) : f.type === "select" ? (
                <select
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx"
                >
                  <option value="">— none —</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "datetime" ? (
                <input
                  type="datetime-local"
                  required={f.required}
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx"
                />
              ) : (
                <input
                  type={f.type === "url" ? "url" : "text"}
                  required={f.required}
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-knx"
                />
              )}
              {f.upload && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <input
                    ref={(el) => {
                      fileInputs.current[f.name] = el;
                    }}
                    type="file"
                    accept={f.upload.accept}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(f, file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputs.current[f.name]?.click()}
                    disabled={uploadingField === f.name || busy}
                    className="rounded-full border border-line px-3 py-1.5 font-medium text-ink transition hover:border-ink disabled:opacity-50"
                  >
                    {uploadingField === f.name
                      ? `Uploading… ${uploadProgress[f.name] ?? 0}%`
                      : `Upload ${f.upload.kind} to R2`}
                  </button>
                  <span className="text-ink-muted">
                    or paste a URL above
                  </span>
                </div>
              )}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-knx-700 disabled:opacity-60"
          >
            {busy ? "Saving…" : editingId == null ? "Save" : "Update"}
          </button>
          {editingId != null && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-semibold">Existing ({initialRows.length})</p>
        </div>
        <ul className="divide-y divide-line">
          {initialRows.map((r) => (
            <li
              key={r.id}
              className={`flex items-center justify-between gap-3 px-5 py-3 ${
                editingId === r.id ? "bg-knx-50" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-ink-muted" dir="ltr">
                  {new Date(r.created_at).toLocaleString()}
                  {!r.published && " · draft"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  disabled={busy}
                  className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  disabled={busy}
                  className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {initialRows.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-ink-muted">No entries yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

async function uploadWithProgress(
  file: File,
  kind: UploadKind,
  onProgress: (pct: number) => void,
): Promise<string> {
  const contentType = file.type || "application/octet-stream";
  const presignRes = await fetch("/api/admin/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name || "upload", contentType, kind }),
  });
  const presign = (await presignRes.json()) as {
    ok?: boolean;
    uploadUrl?: string;
    publicUrl?: string;
    error?: string;
  };
  if (!presignRes.ok || !presign.ok || !presign.uploadUrl || !presign.publicUrl) {
    throw new Error(presign.error || `Could not prepare upload (${presignRes.status})`);
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presign.uploadUrl!);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload to R2 failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  return presign.publicUrl;
}
