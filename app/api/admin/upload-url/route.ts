import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPresignedUploadUrl, r2ConfigError, type UploadKind } from "@/lib/r2";

export const runtime = "nodejs";

function pickKind(value: unknown, contentType: string): UploadKind {
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
  const cfgErr = r2ConfigError();
  if (cfgErr) {
    return NextResponse.json({ ok: false, error: cfgErr }, { status: 500 });
  }

  let payload: { filename?: string; contentType?: string; kind?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const filename = (payload.filename || "").trim();
  const contentType = (payload.contentType || "").trim() || "application/octet-stream";
  if (!filename) {
    return NextResponse.json({ ok: false, error: "Missing filename" }, { status: 400 });
  }
  const kind = pickKind(payload.kind, contentType);

  try {
    const { uploadUrl, publicUrl, key } = await getPresignedUploadUrl({
      kind,
      filename,
      contentType,
    });
    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("R2 presign failed", err);
    const message = err instanceof Error ? err.message : "Failed to sign upload URL";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
