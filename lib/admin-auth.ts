import { cookies } from "next/headers";

export const ADMIN_COOKIE = "knx_admin";

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 4) {
    throw new Error("ADMIN_PASSWORD is not set (min 4 chars)");
  }
  return pw;
}

async function digest(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function adminToken(): Promise<string> {
  return digest("knx-admin:" + getAdminPassword());
}

export async function checkPassword(input: string): Promise<boolean> {
  return input === getAdminPassword();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    return token === (await adminToken());
  } catch {
    return false;
  }
}
