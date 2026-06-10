import { ensureSchema, sql } from "@/lib/db";
import { decodeJoinToken } from "@/lib/join-actions";
import { notifyJoinResponse } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(opts: { heading: string; message: string; ok: boolean }): Response {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://knx-jordan-club.com";
  const logoUrl = process.env.EMAIL_LOGO_URL || `${siteUrl}/KNX_logo.svg.png`;
  const accent = opts.ok ? "#00965e" : "#b91c1c";
  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>KNX Club Jordan</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a;">
    <div style="max-width:520px;margin:48px auto;padding:0 16px;">
      <div style="background:#ffffff;border:1px solid #ececea;border-radius:16px;padding:40px 36px;text-align:center;">
        <img src="${logoUrl}" alt="KNX Club Jordan" width="120" style="display:inline-block;max-width:120px;height:auto;border:0;" />
        <h1 style="margin:24px 0 12px 0;font-size:22px;color:${accent};">${escapeHtml(opts.heading)}</h1>
        <p style="margin:0;font-size:16px;line-height:1.7;color:#3a3a3a;">${escapeHtml(opts.message)}</p>
        <p style="margin:28px 0 0 0;font-size:13px;color:#8a8a86;">
          <a href="${siteUrl}" style="color:#1a1a1a;text-decoration:underline;">KNX Club Jordan</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
  return new Response(html, {
    status: opts.ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("t") ?? "";

  if (action !== "proceed" && action !== "cancel") {
    return page({
      heading: "Invalid link",
      message: "This link is not valid. Please use the buttons in the email you received.",
      ok: false,
    });
  }

  const payload = await decodeJoinToken(token);
  if (!payload) {
    return page({
      heading: "Link expired or invalid",
      message:
        "We couldn't verify this link. Please contact the club if you believe this is an error.",
      ok: false,
    });
  }

  try {
    await ensureSchema();
    await sql`
      INSERT INTO join_responses (name, email, action)
      VALUES (${payload.name || null}, ${payload.email}, ${action})
    `;
    // Best-effort admin notification — don't fail the page if email errors.
    try {
      await notifyJoinResponse({ name: payload.name, email: payload.email, action });
    } catch (err) {
      console.error("notifyJoinResponse error", err);
    }
  } catch (err) {
    console.error("join-response error", err);
    return page({
      heading: "Something went wrong",
      message: "We couldn't record your response. Please try again or contact the club.",
      ok: false,
    });
  }

  const name = payload.name ? `, ${payload.name}` : "";
  if (action === "proceed") {
    return page({
      heading: "Thank you" + name + "!",
      message:
        "We've recorded that you'd like to proceed with joining KNX Club Jordan. Our team will be in touch with you shortly.",
      ok: true,
    });
  }
  return page({
    heading: "Noted" + name,
    message:
      "We've recorded that you'd prefer not to proceed at this time. Thank you for letting us know — you're welcome to join us anytime.",
    ok: true,
  });
}
