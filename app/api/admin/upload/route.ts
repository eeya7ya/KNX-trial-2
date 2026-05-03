import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadToR2, isR2Configured, type UploadKind } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

function pickKind(value: FormDataEntryValue | null, contentType: string): UploadKind {
  const explicit = typeof value === "string" ? value.toLowerCase() : "";
  if (explicit === "image" || explicit === "video" || explicit === "file") return explicit;
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  return "file";
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json(
      { ok: false, error: "R2 storage is not configured on the server" },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid multipart form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `File too large (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB)` },
      { status: 413 },
    );
  }

  const kind = pickKind(form.get("kind"), file.type || "");
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const { url, key } = await uploadToR2({
      kind,
      filename: file.name || "upload",
      contentType: file.type || "application/octet-stream",
      body: buf,
    });
    return NextResponse.json({ ok: true, url, key });
  } catch (err) {
    console.error("R2 upload failed", err);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
