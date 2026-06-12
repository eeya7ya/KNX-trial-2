// Predefined welcome-message templates for the admin "Send email" page.
//
// All three are the same KNX Club Jordan welcome letter; they differ only in
// the membership fees shown (or, for the honorary tier, no fees at all). The
// admin picks a template and fills in the recipient's name + email — the body
// is assembled automatically from the values below.
//
// To adjust the amounts, edit the `annualFee` / `joiningFee` numbers here in
// one place; the wording is generated for you.

export type EmailTemplate = {
  id: string;
  /** Short English label shown in the admin dropdown. */
  label: string;
  /** Longer description shown under the dropdown. */
  description: string;
  /** Subject line sent with the email. */
  subject: string;
  /** Annual subscription fee in JOD, or null to omit the fees paragraph. */
  annualFee: number | null;
  /** One-time joining fee in JOD, or null to omit the fees paragraph. */
  joiningFee: number | null;
  /** Note shown in place of the fees paragraph when fees are null. */
  complimentaryNote?: string;
};

export const MEMBERS_URL = "https://www.knx-jordan-club.com/en/members";

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome-standard",
    label: "Welcome — standard (35 / 10 JOD)",
    description:
      "Standard welcome letter: 35 JOD annual subscription + 10 JOD one-time joining fee.",
    subject: "Welcome to KNX Club Jordan",
    annualFee: 35,
    joiningFee: 10,
  },
  {
    id: "welcome-student",
    label: "Welcome — university student (10 / 5 JOD)",
    description:
      "Student welcome letter: discounted 10 JOD annual subscription + 5 JOD one-time joining fee.",
    subject: "Welcome to KNX Club Jordan",
    annualFee: 10,
    joiningFee: 5,
  },
  {
    id: "welcome-honorary",
    label: "Welcome — honorary (no fees)",
    description:
      "Complimentary / honorary membership welcome letter with no fees shown.",
    subject: "Welcome to KNX Club Jordan",
    annualFee: null,
    joiningFee: null,
    complimentaryNote:
      "We are also pleased to grant you an honorary membership in the club at no cost, in appreciation of your role and contribution.",
  },
];

export function getTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Build the plain-text body for a template, inserting the recipient's name into
 * the greeting when provided. The body uses `* ` bullets and blank lines
 * between paragraphs; the email renderer turns these into a styled list,
 * paragraphs, and a clickable button.
 */
export function buildBody(template: EmailTemplate, name: string): string {
  const trimmed = name.trim();
  const greeting = trimmed ? `Dear ${trimmed},\n\n` : "";

  const feesBlock =
    template.annualFee != null && template.joiningFee != null
      ? `Regarding the fees, they are as follows:
* Annual subscription and participation fee: ${template.annualFee} JOD per year.
* One-time joining fee for first-time members: ${template.joiningFee} JOD.`
      : (template.complimentaryNote ?? "");

  return `${greeting}Thank you for your interest in KNX Club Jordan.

We are delighted to welcome you to the club, which offers its members a range of integrated services, most notably:

* Hands-on ETS6 training workshops for all levels, from beginner to advanced.
* Open monthly meetups to exchange expertise among engineers, specialists, and consultants.
* Opportunities to collaborate on joint projects across the public and private sectors.
* A technical resource library with guides, design documents, and templates in both Arabic and English.

You can view all the details and services at the following link:

${MEMBERS_URL}

${feesBlock}

We are glad to have you with us and remain ready to answer any questions.

Best regards,
KNX Club Jordan`;
}
