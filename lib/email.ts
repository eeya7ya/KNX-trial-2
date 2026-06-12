import { encodeJoinToken } from "./join-actions";

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
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://knx-jordan-club.com";
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

function linkify(escaped: string): string {
  // Turn bare http(s) URLs into links. Runs on already-escaped text. Uses the
  // same neutral ink color as the rest of the email — no accent color.
  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) =>
      `<a href="${url}" style="color:#1a1a1a;text-decoration:underline;word-break:break-all;">${url}</a>`,
  );
}

/**
 * Render a plain-text body into rich, email-safe HTML. Blank lines separate
 * paragraphs; lines starting with `* ` or `- ` become a bullet list. URLs are
 * turned into simple inline links.
 */
function renderBody(body: string, align: string): string {
  const blocks = body.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
  const listPad = align === "right" ? "padding-right:22px;" : "padding-left:22px;";

  return blocks
    .map((raw) => {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return "";

      // Bullet list
      if (lines.every((l) => /^[*-]\s+/.test(l))) {
        const items = lines
          .map((l) => {
            const text = linkify(escapeHtml(l.replace(/^[*-]\s+/, "")));
            return `<li style="margin:0 0 10px 0;font-size:16px;line-height:1.75;color:#1a1a1a;">${text}</li>`;
          })
          .join("");
        return `<ul style="margin:0 0 18px 0;${listPad}list-style-type:disc;">${items}</ul>`;
      }

      // Paragraph (standalone URLs become inline links via linkify)
      const html = linkify(escapeHtml(raw.trim())).replace(/\n/g, "<br />");
      return `<p style="margin:0 0 18px 0;font-size:16px;line-height:1.8;color:#1a1a1a;">${html}</p>`;
    })
    .join("\n");
}

export type EmailActions = { proceedUrl: string; cancelUrl: string };

function renderActions(actions: EmailActions, align: string): string {
  // Two buttons — Cancel (neutral) on the left, Proceed (green) always on the
  // right — plus a professional disclaimer.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px 0;">
  <tr>
    <td style="padding:0 10px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:10px;border:1px solid #d6d6d3;">
        <a href="${actions.cancelUrl}" style="display:inline-block;padding:11px 25px;font-size:15px;font-weight:600;color:#525252;text-decoration:none;border-radius:10px;">Cancel Joining</a>
      </td></tr></table>
    </td>
    <td>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:10px;background:#00965e;">
        <a href="${actions.proceedUrl}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Proceed Joining</a>
      </td></tr></table>
    </td>
  </tr>
</table>
<p style="margin:14px 0 0 0;font-size:13px;line-height:1.7;color:#8a8a86;text-align:${align};">
  If you received this email by mistake or are unsure why it reached you, please disregard it entirely — no action is required on your part.
</p>`;
}

function renderCustomHtml(
  subject: string,
  body: string,
  logoUrl: string,
  actions?: EmailActions,
): string {
  // Auto-detect direction so Arabic and English both render naturally.
  const rtl = /[؀-ۿ]/.test(body + subject);
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const bodyHtml = renderBody(body, align);
  const actionsRow = actions
    ? `<tr>
              <td style="padding:6px 36px 22px 36px;direction:${dir};text-align:${align};">
                ${renderActions(actions, align)}
              </td>
            </tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="${rtl ? "ar" : "en"}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f6f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececea;">
            <tr>
              <td style="padding:36px 36px 8px 36px;direction:${dir};text-align:${align};">
                ${bodyHtml}
              </td>
            </tr>
            ${actionsRow}
            <tr>
              <td style="padding:0 36px;">
                <hr style="border:none;border-top:1px solid #ececea;margin:0;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 36px 32px 36px;">
                <img src="${logoUrl}" alt="KNX Club Jordan" width="120" style="display:block;max-width:120px;height:auto;border:0;outline:none;text-decoration:none;" />
                <p style="margin:14px 0 0 0;font-size:12px;line-height:1.6;color:#8a8a86;">
                  KNX Club Jordan — Amman, Jordan
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

/**
 * Send a one-off email composed in the admin panel. Throws on failure so the
 * caller can record the error. Returns the Resend message id on success.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
  /** When set, adds Proceed / Cancel joining buttons for this recipient. */
  joinActions?: { name: string };
}): Promise<{ id: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY or RESEND_FROM is not set");
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://knx-jordan-club.com";
  const logoUrl = process.env.EMAIL_LOGO_URL || `${siteUrl}/KNX_logo.svg.png`;

  let actions: EmailActions | undefined;
  if (opts.joinActions) {
    const token = await encodeJoinToken({ name: opts.joinActions.name, email: opts.to });
    const t = encodeURIComponent(token);
    actions = {
      proceedUrl: `${siteUrl}/api/join-response?action=proceed&t=${t}`,
      cancelUrl: `${siteUrl}/api/join-response?action=cancel&t=${t}`,
    };
  }

  const html = renderCustomHtml(opts.subject, opts.body, logoUrl, actions);

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      reply_to: opts.replyTo || process.env.ADMIN_EMAIL || undefined,
      subject: opts.subject,
      html,
      text: opts.body,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${errBody}`);
  }

  const data = (await res.json().catch(() => null)) as { id?: string } | null;
  return { id: data?.id ?? null };
}

export type AdminNotificationField = { label: string; value: string };

function renderAdminHtml(opts: {
  title: string;
  intro: string;
  fields: AdminNotificationField[];
  submittedAt: string;
}): string {
  const rows = opts.fields
    .map(
      (f) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #ececea;font-size:13px;color:#6b6b66;width:140px;vertical-align:top;">${escapeHtml(f.label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #ececea;font-size:14px;color:#1a1a1a;white-space:pre-wrap;word-break:break-word;">${escapeHtml(f.value || "—")}</td>
        </tr>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f6f4;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececea;">
          <tr><td style="padding:28px 28px 8px 28px;">
            <h1 style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#1a1a1a;">${escapeHtml(opts.title)}</h1>
            <p style="margin:0 0 18px 0;font-size:14px;color:#3a3a3a;line-height:1.6;">${escapeHtml(opts.intro)}</p>
          </td></tr>
          <tr><td style="padding:0 28px 24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ececea;border-radius:10px;overflow:hidden;">
              ${rows}
              <tr>
                <td style="padding:10px 14px;font-size:13px;color:#6b6b66;width:140px;vertical-align:top;">Submitted at</td>
                <td style="padding:10px 14px;font-size:14px;color:#1a1a1a;">${escapeHtml(opts.submittedAt)}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function renderAdminText(opts: {
  title: string;
  intro: string;
  fields: AdminNotificationField[];
  submittedAt: string;
}): string {
  return [
    opts.title,
    opts.intro,
    "",
    ...opts.fields.map((f) => `${f.label}: ${f.value || "—"}`),
    `Submitted at: ${opts.submittedAt}`,
  ].join("\n");
}

export async function notifyAdmin(opts: {
  kind: AutoReplyKind;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  subject?: string;
  message?: string;
  locale?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !adminEmail) {
    console.warn(
      "notifyAdmin: RESEND_API_KEY, RESEND_FROM or ADMIN_EMAIL not set; skipping admin email.",
    );
    return;
  }

  const isJoin = opts.kind === "join";
  const title = isJoin
    ? "New membership signup — KNX Club Jordan"
    : "New contact message — KNX Club Jordan";
  const intro = isJoin
    ? "A new person has requested to join the club. Their details are below."
    : "A new contact message has been submitted. Details are below.";

  const fields: AdminNotificationField[] = [
    { label: "Name", value: opts.name },
    { label: "Email", value: opts.email },
  ];
  if (isJoin) {
    fields.push({ label: "Phone", value: opts.phone ?? "" });
    fields.push({ label: "Role / interest", value: opts.role ?? "" });
  } else {
    fields.push({ label: "Subject", value: opts.subject ?? "" });
    fields.push({ label: "Message", value: opts.message ?? "" });
  }
  if (opts.locale) fields.push({ label: "Locale", value: opts.locale });

  const submittedAt = new Date().toISOString();
  const subjectLine = isJoin
    ? `[KNX] New signup: ${opts.name}`
    : `[KNX] New contact: ${opts.subject || opts.name}`;

  const html = renderAdminHtml({ title, intro, fields, submittedAt });
  const text = renderAdminText({ title, intro, fields, submittedAt });

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: adminEmail.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: opts.email,
      subject: subjectLine,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Resend admin error ${res.status}: ${errBody}`);
  }
}

/**
 * Notify the admin inbox when a welcome-email recipient clicks Proceed or
 * Cancel. Best-effort: logs and returns if Resend/admin env is not configured.
 */
export async function notifyJoinResponse(opts: {
  name: string;
  email: string;
  action: "proceed" | "cancel";
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !adminEmail) {
    console.warn(
      "notifyJoinResponse: RESEND_API_KEY, RESEND_FROM or ADMIN_EMAIL not set; skipping.",
    );
    return;
  }

  const proceed = opts.action === "proceed";
  const who = opts.name || opts.email;
  const title = proceed
    ? "Member chose to proceed with joining — KNX Club Jordan"
    : "Member chose to cancel joining — KNX Club Jordan";
  const intro = proceed
    ? "A welcome-email recipient confirmed they would like to proceed with joining."
    : "A welcome-email recipient indicated they do not wish to proceed at this time.";

  const fields: AdminNotificationField[] = [
    { label: "Name", value: opts.name },
    { label: "Email", value: opts.email },
    { label: "Decision", value: proceed ? "Proceed joining" : "Cancel joining" },
  ];
  const submittedAt = new Date().toISOString();
  const subjectLine = `[KNX] ${who} — ${proceed ? "Proceed" : "Cancel"} joining`;

  const html = renderAdminHtml({ title, intro, fields, submittedAt });
  const text = renderAdminText({ title, intro, fields, submittedAt });

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: adminEmail.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: opts.email,
      subject: subjectLine,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Resend join-response error ${res.status}: ${errBody}`);
  }
}
