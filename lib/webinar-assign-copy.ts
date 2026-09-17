import type { Locale } from "@/lib/i18n";

/* Copy for the temporary /WebinarsAssign page. It is kept here rather than in
   the site Dict because the page is meant to come down again — deleting the
   route means deleting this file, with nothing left behind in the shared
   dictionary or in the admin content editor. */

export type WebinarAssignCopy = {
  eyebrow: string;
  h1: string;
  sub: string;
  window: string;
  s1: string;
  s1hint: string;
  name: string;
  namePh: string;
  exp: string;
  expPh: string;
  photo: string;
  photoHint: string;
  choose: string;
  change: string;
  remove: string;
  s2: string;
  s2hint: string;
  webinar: string;
  webinarPh: string;
  s3: string;
  s3hint: string;
  legFree: string;
  legTaken: string;
  legPick: string;
  legOut: string;
  empty: string;
  slot: string;
  submit: string;
  submitting: string;
  foot: string;
  langAria: string;
  taken: string;
  out: string;
  monthNames: string[];
  dowShort: string[];
  dayNames: string[];
  success: string;
  conflict: string;
  needName: string;
  needTitle: string;
  needDate: string;
  photoTooBig: string;
  photoWrongType: string;
  photoFailed: string;
  serverError: string;
  networkError: string;
  backHome: string;
};

const ar: WebinarAssignCopy = {
  eyebrow: "تقديم متحدّث",
  h1: "احجز موعد ندوتك",
  sub: "املأ بياناتك مرة واحدة. تُثبَّت جلستك عند اختيارك يومًا متاحًا.",
  window: "المواعيد المتاحة: {first} – {last}",
  s1: "بياناتك",
  s1hint: "تظهر في صفحة الندوة وفي بطاقة الفعالية.",
  name: "الاسم الكامل",
  namePh: "كما سيظهر في صفحة الفعالية",
  exp: "الخبرة",
  expPh:
    "سطران أو ثلاثة: المسمّى الوظيفي، سنوات العمل مع KNX، الشهادات (ETS6، شريك KNX)",
  photo: "الصورة",
  photoHint: "PNG أو JPG، مربعة، 600 × 600 بكسل على الأقل.",
  choose: "اختر ملفًا",
  change: "تغيير",
  remove: "إزالة",
  s2: "ندوتك",
  s2hint: "عنوان واحد واضح. لا شعارات تسويقية.",
  webinar: "عنوان الندوة",
  webinarPh: "العنوان الذي سيراه الحضور",
  s3: "موعدك",
  s3hint: "متحدّث واحد في اليوم. الأيام المحجوزة مغلقة أمام الجميع.",
  legFree: "متاح",
  legTaken: "محجوز",
  legPick: "اختيارك",
  legOut: "خارج الفترة",
  empty: "لم تختر موعدًا بعد.",
  slot: "موعدك — ",
  submit: "أرسل جلستي",
  submitting: "جارٍ الإرسال…",
  foot: "راجع بياناتك قبل الإرسال — يُقفل الموعد باسمك فور الإرسال.",
  langAria: "اللغة",
  taken: "محجوز",
  out: "خارج الفترة المتاحة",
  monthNames: [
    "كانون الثاني",
    "شباط",
    "آذار",
    "نيسان",
    "أيار",
    "حزيران",
    "تموز",
    "آب",
    "أيلول",
    "تشرين الأول",
    "تشرين الثاني",
    "كانون الأول",
  ],
  dowShort: ["ح", "ن", "ث", "ر", "خ", "ج", "س"],
  dayNames: [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ],
  success: "تم الحجز. الموعد مقفل باسمك وسنتواصل معك قريبًا.",
  conflict: "حُجز هذا اليوم للتو. اختر يومًا آخر من المتاح.",
  needName: "الرجاء إدخال اسمك الكامل.",
  needTitle: "الرجاء إدخال عنوان الندوة.",
  needDate: "الرجاء اختيار يوم متاح.",
  photoTooBig: "حجم الصورة كبير جدًا (الحد 5 ميغابايت).",
  photoWrongType: "الصورة يجب أن تكون PNG أو JPG أو WebP.",
  photoFailed: "تم حفظ حجزك، لكن تعذّر رفع الصورة. سنطلبها منك لاحقًا.",
  serverError: "خطأ في الخادم. حاول مرة أخرى لاحقًا.",
  networkError: "تعذّر الاتصال. تحقّق من الشبكة وحاول مرة أخرى.",
  backHome: "العودة إلى الصفحة الرئيسية",
};

const en: WebinarAssignCopy = {
  eyebrow: "PRESENTER SUBMISSION",
  h1: "Book your webinar slot",
  sub: "Fill in your details once. Your session is held as soon as you pick a free day.",
  window: "Available dates: {first} – {last}",
  s1: "About you",
  s1hint: "Shown on the webinar page and on the event card.",
  name: "Full name",
  namePh: "As it should appear on the event page",
  exp: "Experience",
  expPh:
    "Two or three lines: your role, years working with KNX, certifications (ETS6, KNX Partner)",
  photo: "Photo",
  photoHint: "PNG or JPG, square, at least 600 × 600 px.",
  choose: "Choose file",
  change: "Change",
  remove: "Remove",
  s2: "Your webinar",
  s2hint: "One clear title. No marketing slogans.",
  webinar: "Webinar title",
  webinarPh: "The title attendees will see",
  s3: "Your date",
  s3hint: "One presenter per day. Days already taken are closed to everyone.",
  legFree: "Available",
  legTaken: "Taken",
  legPick: "Your pick",
  legOut: "Outside window",
  empty: "No date chosen yet.",
  slot: "Your slot — ",
  submit: "Submit my session",
  submitting: "Submitting…",
  foot: "Check your details before submitting — the day is locked to your name once you send it.",
  langAria: "Language",
  taken: "Taken",
  out: "Outside the available window",
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  dowShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  success: "Booked. The day is locked to your name — we'll be in touch shortly.",
  conflict: "That day was just taken. Please pick another free day.",
  needName: "Please enter your full name.",
  needTitle: "Please enter your webinar title.",
  needDate: "Please pick a free day.",
  photoTooBig: "That photo is too large (5 MB max).",
  photoWrongType: "The photo must be a PNG, JPG or WebP image.",
  photoFailed: "Your slot is saved, but the photo could not be uploaded. We'll ask for it later.",
  serverError: "Server error. Please try again later.",
  networkError: "Could not reach the server. Check your connection and try again.",
  backHome: "Back to home",
};

export function getWebinarAssignCopy(locale: Locale): WebinarAssignCopy {
  return locale === "ar" ? ar : en;
}

/** "2026-09-20" → "20 September 2026" / "20 أيلول 2026". */
export function formatWindowDate(iso: string, copy: WebinarAssignCopy): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${copy.monthNames[m - 1]} ${y}`;
}
