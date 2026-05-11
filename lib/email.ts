type AutoReplyKind = "join" | "contact";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type CopyBlock = {
  subject: string;
  preheader: string;
  greeting: (name: string) => string;
  welcome: string;
  receipt: string;
  signoff: string;
  team: string;
  footerNote: string;
  dir: "rtl" | "ltr";
  lang: "ar" | "en";
};

function copyFor(kind: AutoReplyKind, locale: string): CopyBlock {
  const ar = locale.toLowerCase().startsWith("ar");
  if (ar) {
    return {
      subject:
        kind === "join"
          ? "مرحبًا بك في نادي KNX الأردني"
          : "استلمنا رسالتك — نادي KNX الأردني",
      preheader:
        kind === "join"
          ? "تم استلام طلب انضمامك، وسنعود إليك خلال 24 ساعة."
          : "تم استلام رسالتك، وسنعود إليك خلال 24 ساعة.",
      greeting: (name) => `مرحبًا ${name}،`,
      welcome:
        kind === "join"
          ? "شكرًا لاهتمامك بالانضمام إلى نادي KNX الأردني — يسعدنا أن تكون جزءًا من مجتمعنا."
          : "شكرًا لتواصلك مع نادي KNX الأردني — يسعدنا تواصلك معنا.",
      receipt:
        kind === "join"
          ? "لقد تسلّمنا طلبك بنجاح، وسيقوم أحد أعضاء فريقنا بالردّ عليك خلال 24 ساعة."
          : "لقد تسلّمنا رسالتك بنجاح، وسنعود إليك بالرد خلال 24 ساعة.",
      signoff: "مع التحية،",
      team: "فريق نادي KNX الأردني",
      footerNote: "نادي KNX الأردني — Amman, Jordan",
      dir: "rtl",
      lang: "ar",
    };
  }
  return {
    subject:
      kind === "join"
        ? "Welcome to the KNX Club Jordan"
        : "We received your message — KNX Club Jordan",
    preheader:
      kind === "join"
        ? "Your membership request has been received. We'll get back to you within 24 hours."
        : "Your message has been received. We'll get back to you within 24 hours.",
    greeting: (name) => `Hi ${name},`,
    welcome:
      kind === "join"
        ? "Thank you for your interest in joining the KNX Club Jordan — we're glad to have you with us."
        : "Thank you for reaching out to the KNX Club Jordan — we're glad you got in touch.",
    receipt:
      kind === "join"
        ? "We've successfully received your request, and a member of our team will reply to you within 24 hours."
        : "We've successfully received your message, and we will get back to you within 24 hours.",
    signoff: "Best regards,",
    team: "KNX Club Jordan team",
    footerNote: "KNX Club Jordan — Amman, Jordan",
    dir: "ltr",
    lang: "en",
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(c: CopyBlock, name: string, logoUrl: string): string {
  const safeName = escapeHtml(name);
  return `<!DOCTYPE html>
<html lang="${c.lang}" dir="${c.dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(c.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a;">
    <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(c.preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f6f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececea;">
            <tr>
              <td style="padding:36px 36px 8px 36px;direction:${c.dir};text-align:${c.dir === "rtl" ? "right" : "left"};">
                <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.4;color:#1a1a1a;font-weight:700;">
                  ${escapeHtml(c.greeting(safeName))}
                </h1>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#1a1a1a;">
                  ${escapeHtml(c.welcome)}
                </p>
                <p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#3a3a3a;">
                  ${escapeHtml(c.receipt)}
                </p>
                <p style="margin:0 0 4px 0;font-size:15px;line-height:1.6;color:#1a1a1a;">
                  ${escapeHtml(c.signoff)}
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.6;color:#1a1a1a;font-weight:600;">
                  ${escapeHtml(c.team)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px;">
                <hr style="border:none;border-top:1px solid #ececea;margin:0;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 36px 32px 36px;">
                <img src="${logoUrl}" alt="KNX Club Jordan" width="120" style="display:block;max-width:120px;height:auto;border:0;outline:none;text-decoration:none;" />
                <p style="margin:14px 0 0 0;font-size:12px;line-height:1.6;color:#8a8a86;">
                  ${escapeHtml(c.footerNote)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(c: CopyBlock, name: string): string {
  return [
    c.greeting(name),
    "",
    c.welcome,
    "",
    c.receipt,
    "",
    c.signoff,
    c.team,
    "",
    c.footerNote,
  ].join("\n");
}

export async function sendAutoReply(opts: {
  to: string;
  name: string;
  kind: AutoReplyKind;
  locale?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn("sendAutoReply: RESEND_API_KEY or RESEND_FROM not set; skipping email.");
    return;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://knxclub.jo";
  const logoUrl =
    process.env.EMAIL_LOGO_URL || `${siteUrl}/KNX_logo.svg.png`;

  const copy = copyFor(opts.kind, opts.locale ?? "ar");
  const html = renderHtml(copy, opts.name || "", logoUrl);
  const text = renderText(copy, opts.name || "");

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: copy.subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${errBody}`);
  }
}
