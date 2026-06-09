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

export const MEMBERS_URL = "https://www.knx-jordan-club.com/ar/members";

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome-standard",
    label: "Welcome — standard (25 / 20 JOD)",
    description:
      "Standard welcome letter: 25 JOD annual subscription + 20 JOD one-time joining fee.",
    subject: "مرحباً بكم في نادي KNX الأردني — KNX Club Jordan",
    annualFee: 25,
    joiningFee: 20,
  },
  {
    id: "welcome-student",
    label: "Welcome — university student (10 / 20 JOD)",
    description:
      "Student welcome letter: discounted 10 JOD annual subscription + 20 JOD one-time joining fee.",
    subject: "مرحباً بكم في نادي KNX الأردني — KNX Club Jordan",
    annualFee: 10,
    joiningFee: 20,
  },
  {
    id: "welcome-honorary",
    label: "Welcome — honorary (no fees)",
    description:
      "Complimentary / honorary membership welcome letter with no fees shown.",
    subject: "مرحباً بكم في نادي KNX الأردني — KNX Club Jordan",
    annualFee: null,
    joiningFee: null,
    complimentaryNote:
      "ويسعدنا أن نمنحكم عضوية فخرية في النادي دون أي رسوم، تقديراً لدوركم ومساهمتكم.",
  },
];

export function getTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Build the plain-text Arabic body for a template, inserting the recipient's
 * name into the greeting when provided. The body uses `* ` bullets and blank
 * lines between paragraphs; the email renderer turns these into a styled list,
 * paragraphs, and a clickable button.
 */
export function buildBody(template: EmailTemplate, name: string): string {
  const trimmed = name.trim();
  const greeting = trimmed ? `مرحباً ${trimmed}،\n\n` : "";

  const feesBlock =
    template.annualFee != null && template.joiningFee != null
      ? `أما بخصوص الرسوم، فهي كالتالي:
* رسوم الاشتراك والمشاركة السنوية: ${template.annualFee} ديناراً أردنياً سنوياً.
* رسوم انتساب لمرة واحدة عند الانضمام لأول مرة: ${template.joiningFee} ديناراً أردنياً.`
      : (template.complimentaryNote ?? "");

  return `${greeting}شكراً لاهتمامكم بنادي KNX الأردني (KNX Club Jordan).

يسعدنا انضمامكم إلى النادي، الذي يوفّر لأعضائه مجموعة من الخدمات المتكاملة، من أبرزها:

* ورش تدريبية عملية على برنامج ETS6 لجميع المستويات من المبتدئ إلى المتقدّم.
* لقاءات شهرية مفتوحة لتبادل الخبرات بين المهندسين والمختصّين والاستشاريين.
* فرص للتعاون في مشاريع مشتركة ضمن القطاعين العام والخاص.
* مكتبة موارد تقنية تضمّ أدلة ووثائق تصميم ونماذج باللغتين العربية والإنجليزية.

ويمكنكم الاطلاع على كامل التفاصيل والخدمات عبر الرابط التالي:

${MEMBERS_URL}

${feesBlock}

يسعدنا انضمامكم، ونبقى على استعداد للإجابة عن أي استفسار.

مع خالص التقدير،
نادي KNX الأردني`;
}
