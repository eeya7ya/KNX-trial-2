import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

let cached: { config: R2Config; client: S3Client } | null = null;

function readConfig(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  const missing = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["R2_BUCKET", bucket],
    ["R2_PUBLIC_BASE_URL", publicBaseUrl],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`R2 env vars missing: ${missing.join(", ")}`);
  }
  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucket: bucket!,
    publicBaseUrl: publicBaseUrl!.replace(/\/+$/, ""),
  };
}

function getClient() {
  if (cached) return cached;
  const config = readConfig();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  cached = { config, client };
  return cached;
}

export type UploadKind = "image" | "video" | "file";

const KIND_PREFIX: Record<UploadKind, string> = {
  image: "images",
  video: "videos",
  file: "files",
};

function safeBaseName(name: string): string {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
  const base = (name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const cleanExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 10);
  return cleanExt ? `${base || "file"}.${cleanExt}` : base || "file";
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

export function buildObjectKey(kind: UploadKind, originalName: string): string {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${KIND_PREFIX[kind]}/${yyyy}/${mm}/${randomId()}-${safeBaseName(originalName)}`;
}

export async function uploadToR2(args: {
  kind: UploadKind;
  filename: string;
  contentType: string;
  body: Buffer | Uint8Array;
}): Promise<{ key: string; url: string }> {
  const { config, client } = getClient();
  const key = buildObjectKey(args.kind, args.filename);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: args.body,
      ContentType: args.contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return { key, url: `${config.publicBaseUrl}/${key}` };
}

export async function deleteFromR2(key: string): Promise<void> {
  const { config, client } = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}

export function isR2Configured(): boolean {
  try {
    readConfig();
    return true;
  } catch {
    return false;
  }
}
