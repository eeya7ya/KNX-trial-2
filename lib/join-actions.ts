// Self-contained, signed token embedded in the Proceed/Cancel links of the
// welcome email. It carries the recipient's name + email so the click handler
// knows who responded, and an HMAC signature so the values can't be tampered
// with. Signed with ADMIN_PASSWORD (already required by the app) — no new env
// var needed.
//
// Implemented with Web Crypto (not node:crypto) so this module is safe to bundle
// into both Node and Edge runtimes — lib/email.ts is imported by the Edge
// /api/join route.

export type JoinPayload = { name: string; email: string };

function secret(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD is not set");
  return pw;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

export async function encodeJoinToken(payload: JoinPayload): Promise<string> {
  const data = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(data);
  return `${data}.${sig}`;
}

export async function decodeJoinToken(token: string): Promise<JoinPayload | null> {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = await hmac(data);
  // Constant-time compare.
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(b64urlDecode(data)));
    if (parsed && typeof parsed.email === "string") {
      return { name: String(parsed.name ?? ""), email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}
