export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export type Dict = {
  dir: "rtl" | "ltr";
  htmlLang: string;
  nav: {
    about: string;
    services: string;
    events: string;
    members: string;
    news: string;
    gallery: string;
    faq: string;
    join: string;
    contact: string;
    switchTo: string;
  };
  newsSection: {
    eyebrow: string;
    title: string;
    body: string;
    readMore: string;
    seeAll: string;
    empty: string;
    backToList: string;
  };
  gallerySection: {
    eyebrow: string;
    title: string;
    body: string;
    pictures: string;
    videos: string;
    empty: string;
  };
  membersSection: {
    partnerLabel: string;
  };
  hero: {
    eyebrow: string;
    titleA: string;
    titleAccent: string;
    titleB: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { label: string; value: string }[];
  about: {
    eyebrow: string;
    title: string;
    body: string;
    pillars: { title: string; body: string }[];
  };
  services: {
    eyebrow: string;
    title: string;
    brief: string;
    items: { title: string; body: string }[];
  };
  events: {
    eyebrow: string;
    title: string;
    body: string;
    soon: string;
    rows: { tag: string; title: string; meta: string }[];
  };
  join: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    email: string;
    role: string;
    rolePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    networkError: string;
    invalidName: string;
    invalidEmail: string;
    invalidRole: string;
    serverError: string;
    invalidJson: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    brief: string;
    items: { q: string; a: string }[];
  };
  members: {
    eyebrow: string;
    title: string;
    brief: string;
    boardLabel: string;
    partnersLabel: string;
    items: { name: string; role: string; company?: string }[];
    partners: string[];
  };
  footer: {
    tagline: string;
    rights: string;
    contact: string;
  };
  detailCta: string;
  close: string;
};

const ar: Dict = {
  dir: "rtl",
  htmlLang: "ar",
  nav: {
    about: "من نحن",
    services: "الخدمات",
    events: "الفعاليات",
    members: "الأعضاء",
    news: "الأخبار",
    gallery: "المعرض",
    faq: "الأسئلة",
    join: "انضم إلينا",
    contact: "تواصل",
    switchTo: "EN",
  },
  newsSection: {
    eyebrow: "آخر الأخبار",
    title: "أحدث ما لدينا",
    body: "أهم الأخبار والتحديثات من الفريق.",
    readMore: "اقرأ المزيد",
    seeAll: "كل الأخبار",
    empty: "لا توجد أخبار منشورة بعد.",
    backToList: "العودة إلى الأخبار",
  },
  gallerySection: {
    eyebrow: "المعرض",
    title: "صور وفيديوهات",
    body: "لقطات من الفعاليات والورش والمشاريع.",
    pictures: "صور",
    videos: "فيديوهات",
    empty: "لا توجد عناصر بعد.",
  },
  membersSection: {
    partnerLabel: "شريك KNX",
  },
  hero: {
    eyebrow: "نادي KNX الأردني",
    titleA: "مبانٍ ذكية،",
    titleAccent: "معيار مفتوح،",
    titleB: "مجتمع واحد.",
    body:
      "نادي KNX الأردني يجمع المهندسين والمكاملين والمعماريين والمختصين بأنظمة أتمتة المباني والمنازل الذكية وفق المعيار العالمي KNX.",
    primaryCta: "انضم إلى النادي",
    secondaryCta: "تعرّف علينا",
  },
  stats: [
    { label: "مهندس ومكامل", value: "+150" },
    { label: "ورشة تدريبية سنوياً", value: "12" },
    { label: "شركة شريكة", value: "+30" },
    { label: "سنة خبرة جماعية", value: "20" },
  ],
  about: {
    eyebrow: "من نحن",
    title: "مجتمع مهني للأنظمة الذكية في الأردن",
    body:
      "نحن جمعية غير ربحية تضم محترفين متخصصين في معيار KNX، نسعى لتطوير سوق أتمتة المباني في المملكة عبر التدريب، تبادل الخبرات، والمشاريع المشتركة.",
    pillars: [
      {
        title: "خبرة محلية",
        body: "أعضاء النادي يعملون في أكبر مشاريع الأتمتة في الأردن والمنطقة.",
      },
      {
        title: "معيار عالمي",
        body: "نلتزم بمعيار KNX المفتوح المعتمد دولياً (ISO/IEC 14543-3).",
      },
      {
        title: "تطوير مستمر",
        body: "نواكب أحدث تقنيات KNX IoT وKNX Secure والربط مع Matter.",
      },
    ],
  },
  services: {
    eyebrow: "الخدمات",
    title: "ما نقدمه لأعضائنا",
    brief: "تدريب، لقاءات، مشاريع مشتركة، ومكتبة موارد. اضغط للاطلاع على التفاصيل الكاملة.",
    items: [
      {
        title: "تدريب ETS",
        body: "ورش عملية على ETS6 لجميع المستويات من المبتدئ إلى المحترف.",
      },
      {
        title: "لقاءات شهرية",
        body: "جلسات مفتوحة لتبادل الخبرات بين المكاملين والمستشارين.",
      },
      {
        title: "مشاريع مشتركة",
        body: "فرص تعاون على مشاريع كبرى في القطاعين الحكومي والخاص.",
      },
      {
        title: "مكتبة موارد",
        body: "وصول إلى أدلة فنية ومستندات تصميم وقوالب جاهزة بالعربية والإنجليزية.",
      },
      {
        title: "أمن KNX Secure",
        body: "إرشادات تصميم آمنة وفق KNX Data Secure وKNX IP Secure.",
      },
      {
        title: "اعتماد مهني",
        body: "إرشاد للحصول على شهادات KNX Partner وKNX Tutor.",
      },
    ],
  },
  events: {
    eyebrow: "الفعاليات",
    title: "أجندة 2026",
    body: "تابع أبرز ورش العمل واللقاءات. سجّل ليصلك التذكير قبل كل حدث.",
    soon: "قريباً",
    rows: [
      { tag: "ورشة", title: "أساسيات ETS6", meta: "عمّان · ربيع 2026" },
      { tag: "لقاء", title: "KNX Secure وIoT في 2026", meta: "عمّان · صيف 2026" },
      { tag: "مؤتمر", title: "اليوم المهني للأتمتة", meta: "عمّان · خريف 2026" },
    ],
  },
  join: {
    eyebrow: "العضوية",
    title: "انضم إلى النادي",
    body: "اترك بياناتك وسنعلمك بأقرب الفعاليات والفرص التدريبية.",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    role: "التخصص (اختياري)",
    rolePlaceholder: "مكامل، مهندس، معماري، طالب…",
    submit: "سجّلني",
    submitting: "جارٍ الإرسال…",
    success: "شكراً لك — تم تسجيلك بنجاح وسنتواصل معك قريباً.",
    networkError: "تعذّر الاتصال بالخادم. حاول مجدداً.",
    invalidName: "الرجاء إدخال الاسم.",
    invalidEmail: "الرجاء إدخال بريد إلكتروني صحيح.",
    invalidRole: "حقل التخصص طويل جداً.",
    serverError: "حدث خطأ في الخادم. حاول لاحقاً.",
    invalidJson: "بيانات غير صالحة.",
  },
  faq: {
    eyebrow: "أسئلة شائعة",
    title: "قبل أن تنضم",
    brief: "إجابات سريعة على أكثر الأسئلة شيوعاً حول العضوية والورش.",
    items: [
      {
        q: "هل العضوية مدفوعة؟",
        a: "العضوية الأساسية مجانية حالياً، مع خيارات للعضوية المهنية لاحقاً.",
      },
      {
        q: "هل يجب أن أكون شريك KNX معتمداً؟",
        a: "لا، النادي مفتوح للمحترفين والطلاب والهواة المهتمين بالأنظمة الذكية.",
      },
      {
        q: "بأي لغة تُقدَّم الورش؟",
        a: "غالباً بالعربية مع مصطلحات إنجليزية، وبعض الورش تكون بالإنجليزية كاملة.",
      },
    ],
  },
  members: {
    eyebrow: "أعضاء النادي",
    title: "الوجوه التي تقود KNX في الأردن",
    brief: "نخبة من المهندسين والمكاملين والمعماريين والمدرّبين يعملون معاً على تطوير سوق الأنظمة الذكية.",
    boardLabel: "الهيئة المؤسسة",
    partnersLabel: "شركات شريكة",
    items: [
      { name: "م. أحمد العلي", role: "رئيس النادي · مكامل أنظمة KNX", company: "Smart Systems Jordan" },
      { name: "م. ليلى ناصر", role: "نائب الرئيس · مهندسة أتمتة", company: "Amman Automation" },
      { name: "م. خالد دروزة", role: "أمين الصندوق · مستشار تقني", company: "BMS Consultants" },
      { name: "م. هبة قاسم", role: "أمين السر · مهندسة كهرباء", company: "Jordan Electrical Co." },
      { name: "م. عمر الحسيني", role: "عضو · مدرّب KNX معتمد", company: "ETS Training Center" },
      { name: "م. ريم الزعبي", role: "عضو · معمارية أنظمة ذكية", company: "Smart Architects" },
    ],
    partners: [
      "Smart Systems Jordan",
      "Amman Automation",
      "BMS Consultants",
      "Jordan Electrical Co.",
      "ETS Training Center",
      "Smart Architects",
    ],
  },
  footer: {
    tagline: "النادي المهني الأردني لمعيار KNX.",
    rights: "جميع الحقوق محفوظة.",
    contact: "للتواصل",
  },
  detailCta: "اعرض التفاصيل",
  close: "إغلاق",
};

const en: Dict = {
  dir: "ltr",
  htmlLang: "en",
  nav: {
    about: "About",
    services: "Services",
    events: "Events",
    members: "Members",
    news: "News",
    gallery: "Gallery",
    faq: "FAQ",
    join: "Join",
    contact: "Contact",
    switchTo: "ع",
  },
  newsSection: {
    eyebrow: "Latest news",
    title: "Fresh from the club",
    body: "Highlights and updates straight from the team.",
    readMore: "Read more",
    seeAll: "All news",
    empty: "No news published yet.",
    backToList: "Back to news",
  },
  gallerySection: {
    eyebrow: "Gallery",
    title: "Photos & videos",
    body: "Moments from events, workshops, and projects.",
    pictures: "Pictures",
    videos: "Videos",
    empty: "No items yet.",
  },
  membersSection: {
    partnerLabel: "KNX partner",
  },
  hero: {
    eyebrow: "KNX Club Jordan",
    titleA: "Smart buildings,",
    titleAccent: "open standard,",
    titleB: "one community.",
    body:
      "KNX Club Jordan is the professional community for engineers, integrators, architects, and specialists working with the world's leading open standard for home and building automation.",
    primaryCta: "Join the club",
    secondaryCta: "Learn more",
  },
  stats: [
    { label: "Engineers & integrators", value: "150+" },
    { label: "Workshops per year", value: "12" },
    { label: "Partner companies", value: "30+" },
    { label: "Years of collective experience", value: "20" },
  ],
  about: {
    eyebrow: "About",
    title: "A professional community for smart systems in Jordan",
    body:
      "We are a non-profit community of KNX professionals advancing the adoption of building automation across the Kingdom through training, knowledge sharing, and joint projects.",
    pillars: [
      {
        title: "Local expertise",
        body: "Our members deliver the largest automation projects in Jordan and the region.",
      },
      {
        title: "Global standard",
        body: "We work to the open KNX standard (ISO/IEC 14543-3).",
      },
      {
        title: "Always current",
        body: "We track KNX IoT, KNX Secure, and Matter bridges as they evolve.",
      },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "What we offer members",
    brief: "Training, meetups, joint projects, and a resource library. Tap to see full details.",
    items: [
      {
        title: "ETS training",
        body: "Hands-on ETS6 workshops from beginner to advanced level.",
      },
      {
        title: "Monthly meetups",
        body: "Open sessions for integrators and consultants to exchange experience.",
      },
      {
        title: "Joint projects",
        body: "Opportunities to collaborate on large public and private sector projects.",
      },
      {
        title: "Resource library",
        body: "Technical guides, design documents, and templates in Arabic and English.",
      },
      {
        title: "KNX Secure",
        body: "Secure design guidelines following KNX Data Secure and KNX IP Secure.",
      },
      {
        title: "Certification",
        body: "Guidance on becoming a KNX Partner or KNX Tutor.",
      },
    ],
  },
  events: {
    eyebrow: "Events",
    title: "2026 calendar",
    body: "Workshops, meetups, and a yearly conference. Sign up to be notified.",
    soon: "Coming soon",
    rows: [
      { tag: "Workshop", title: "ETS6 Fundamentals", meta: "Amman · Spring 2026" },
      { tag: "Meetup", title: "KNX Secure & IoT in 2026", meta: "Amman · Summer 2026" },
      { tag: "Conference", title: "Automation Professional Day", meta: "Amman · Autumn 2026" },
    ],
  },
  join: {
    eyebrow: "Membership",
    title: "Join the club",
    body: "Leave your details and we'll keep you posted on training and events.",
    name: "Full name",
    email: "Email",
    role: "Role (optional)",
    rolePlaceholder: "Integrator, engineer, architect, student…",
    submit: "Sign me up",
    submitting: "Submitting…",
    success: "Thanks — you're on the list. We'll be in touch.",
    networkError: "Network error. Please try again.",
    invalidName: "Please enter your name.",
    invalidEmail: "Please enter a valid email.",
    invalidRole: "Role is too long.",
    serverError: "Server error. Please try again later.",
    invalidJson: "Invalid request.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Before you join",
    brief: "Quick answers to the most common questions about membership and workshops.",
    items: [
      {
        q: "Is membership paid?",
        a: "Basic membership is currently free, with paid professional tiers planned later.",
      },
      {
        q: "Do I need to be a certified KNX Partner?",
        a: "No. The club is open to professionals, students, and enthusiasts.",
      },
      {
        q: "Which language are workshops delivered in?",
        a: "Mostly Arabic with English technical terms; some workshops are fully in English.",
      },
    ],
  },
  members: {
    eyebrow: "Club members",
    title: "The people powering KNX Jordan",
    brief: "Engineers, integrators, architects, and trainers driving smart-building adoption across the country.",
    boardLabel: "Founding board",
    partnersLabel: "Partner companies",
    items: [
      { name: "Eng. Ahmad Al-Ali", role: "President · KNX integrator", company: "Smart Systems Jordan" },
      { name: "Eng. Layla Nasser", role: "Vice president · Automation engineer", company: "Amman Automation" },
      { name: "Eng. Khaled Darwazeh", role: "Treasurer · Technical consultant", company: "BMS Consultants" },
      { name: "Eng. Heba Qassem", role: "Secretary · Electrical engineer", company: "Jordan Electrical Co." },
      { name: "Eng. Omar Al-Hussaini", role: "Member · Certified KNX tutor", company: "ETS Training Center" },
      { name: "Eng. Reem Al-Zoubi", role: "Member · Smart-systems architect", company: "Smart Architects" },
    ],
    partners: [
      "Smart Systems Jordan",
      "Amman Automation",
      "BMS Consultants",
      "Jordan Electrical Co.",
      "ETS Training Center",
      "Smart Architects",
    ],
  },
  footer: {
    tagline: "The professional KNX community of Jordan.",
    rights: "All rights reserved.",
    contact: "Contact",
  },
  detailCta: "View details",
  close: "Close",
};

const dictionaries: Record<Locale, Dict> = { ar, en };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
