export type Service = {
  name: string;
  summary: string;
  priceLines: string[];
  duration?: string;
};

export type ServiceGroup = {
  name: string;
  services: Service[];
};

export type Testimonial = {
  quote: string;
  author: string;
  photo_url?: string | null;
};

export const business = {
  name: "The Lux Collective Aesthetics & Wellness",
  shortName: "The Lux Collective",
  tagline: "Advanced aesthetics and wellness in Newark, Ohio.",
  description:
    "A warm, science-led med spa focused on natural-looking results, medical-grade treatments, and care that feels personal from the first visit.",
  email: "info@theluxcollectiveaesthetics.com",
  phone: "(740) 504-8780",
  address: {
    street: "1612 N 21st Street",
    city: "Newark",
    state: "OH",
    zip: "43055",
  },
  hours: [
    "Monday, Wednesday-Friday: 9 AM-3 PM",
    "Tuesday: 9 AM-6 PM",
    "Saturday: 9 AM-Noon",
    "Sunday: Closed",
  ],
};

export const serviceGroups: ServiceGroup[] = [
  {
    name: "Injectables",
    services: [
      {
        name: "Toxin",
        summary:
          "Wrinkle relaxers using Botox, Dysport, Xeomin, or Jeuveau — priced per unit.",
        priceLines: ["$10 per unit"],
      },
      {
        name: "Dermal Filler",
        summary: "Volume and contour support with a personalized treatment plan.",
        priceLines: ["$600 per syringe", "$300 per half syringe"],
      },
    ],
  },
  {
    name: "PRP",
    services: [
      {
        name: "Vampire Facial",
        summary:
          "PRP microneedling facial supporting collagen, texture, tone, and skin renewal.",
        priceLines: ["$250"],
        duration: "60 min",
      },
      {
        name: "After Laser Tx PRP",
        summary: "PRP add-on applied after a laser treatment for enhanced recovery and results.",
        priceLines: ["Additional $100"],
      },
      {
        name: "PRP Injections for Face",
        summary: "PRP-based facial injection options customized to your goals.",
        priceLines: ["$150–$450"],
        duration: "60 min",
      },
      {
        name: "Hair Restoration",
        summary: "PRP hair restoration support for eligible clients.",
        priceLines: ["1 tube: $200", "2 tubes: $300"],
      },
      {
        name: "P-Shot",
        summary: "Consultation-led PRP regenerative treatment for men.",
        priceLines: ["$500 per session"],
        duration: "60 min",
      },
      {
        name: "O-Shot",
        summary: "Consultation-led PRP regenerative treatment for women.",
        priceLines: ["$500 per session"],
        duration: "60 min",
      },
    ],
  },
  {
    name: "HRT",
    services: [
      {
        name: "Oral / Injectable HRT",
        summary: "Hormone replacement therapy reviewed by a provider; oral or injectable options with cost determined by type and coverage.",
        priceLines: ["Office visit: $75", "Oral/injectables: cost varies"],
        duration: "45 min",
      },
      {
        name: "Women's Pellet Therapy",
        summary: "Bioidentical hormone pellet therapy for women, inserted by a provider.",
        priceLines: ["$350 per session"],
      },
      {
        name: "Men's Pellet Therapy",
        summary: "Bioidentical hormone pellet therapy for men, inserted by a provider.",
        priceLines: ["$600 per session"],
      },
    ],
  },
  {
    name: "Laser Treatments",
    services: [
      {
        name: "Laser Hair Removal",
        summary: "Targeted hair reduction priced by treatment area.",
        priceLines: [
          "Small area (armpits, bikini line, face): $100 per session",
          "Medium area (Brazilian, lower legs, arms): $200 per session",
          "Large area (back, chest, full legs): $400 per session",
        ],
      },
      {
        name: "Photofacial",
        summary: "Light-based treatment for resurfacing, vascular concerns, and melasma.",
        priceLines: ["$200 per session", "2 sessions: $300"],
      },
    ],
  },
  {
    name: "Massage",
    services: [
      {
        name: "Deep Tissue / Hot Stone Massage",
        summary: "Therapeutic massage using deep tissue or hot stone techniques.",
        priceLines: [
          "30 min: $45",
          "45 min: $60",
          "60 min: $75",
          "75 min: $90",
        ],
      },
      {
        name: "Relaxation Massage",
        summary: "Calming full-body massage focused on stress relief and comfort.",
        priceLines: [
          "30 min: $35",
          "45 min: $50",
          "60 min: $65",
          "75 min: $80",
        ],
      },
      {
        name: "Exfoliation Massage Add-On",
        summary: "Skin-smoothing exfoliation added to any massage service.",
        priceLines: ["$10 add-on"],
      },
    ],
  },
  {
    name: "Facials",
    services: [
      {
        name: "Starter Facial",
        summary: "An introductory facial tailored to your skin's needs.",
        priceLines: ["$50"],
      },
      {
        name: "HydraBoost Facial",
        summary: "Deep hydration facial for plump, glowing skin.",
        priceLines: ["$65"],
      },
      {
        name: "The Purify",
        summary: "Clarifying facial targeting congestion and breakouts.",
        priceLines: ["$70"],
      },
      {
        name: "Age Rewind Radiance",
        summary: "Anti-aging facial for tone, firmness, and radiance.",
        priceLines: ["$75"],
      },
      {
        name: "DermaPlane",
        summary: "Gentle exfoliation treatment removing dead skin and vellus hair.",
        priceLines: ["$75"],
      },
      {
        name: "MicrodermAbrasion",
        summary: "Crystal or diamond-tip resurfacing for smoother, brighter skin.",
        priceLines: ["$85"],
      },
      {
        name: "Microneedling",
        summary: "Collagen-stimulating treatment for texture, scarring, and skin renewal.",
        priceLines: ["$100"],
      },
    ],
  },
  {
    name: "Eye Enhancements",
    services: [
      {
        name: "Lash Lift",
        summary: "Semi-permanent curl treatment that opens and lifts natural lashes.",
        priceLines: ["$55"],
      },
      {
        name: "Lash Tint",
        summary: "Color treatment to darken and define natural lashes.",
        priceLines: ["$30"],
      },
      {
        name: "Lash Tint / Lift Combo",
        summary: "Combined lift and tint for lifted, defined lashes.",
        priceLines: ["$75"],
      },
      {
        name: "Brow Lamination",
        summary: "Smoothing and setting treatment for fuller, more defined brows.",
        priceLines: ["$55"],
      },
      {
        name: "Brow Tint",
        summary: "Color treatment to fill and define brow shape.",
        priceLines: ["$20"],
      },
      {
        name: "Full Brow with Wax",
        summary: "Brow tint, lamination, and wax shaping in one service.",
        priceLines: ["$75"],
      },
    ],
  },
  {
    name: "Waxing",
    services: [
      {
        name: "Back Facial",
        summary: "Deep-cleansing facial treatment for the back, including extractions and masking.",
        priceLines: ["$95"],
      },
      {
        name: "Facial Wax",
        summary: "Brow, lip, and nose waxing for clean, defined lines.",
        priceLines: ["$15"],
      },
    ],
  },
  {
    name: "Wellness",
    services: [
      {
        name: "Medical Weight Loss",
        summary: "Monthly visits and medication options when clinically appropriate.",
        priceLines: [
          "Adipex monthly visit: $75",
          "Semaglutide: $175 (5 mg) or $350 (12.5 mg)",
          "Tirzepatide: $250 (20 mg) or $350 (30 mg)",
        ],
      },
      {
        name: "Cyst I&D and Skin Lesion Removal",
        summary: "Consultation-led treatment; pricing varies by size, number, and location.",
        priceLines: ["Consultation: $25, applied toward same-day treatment"],
      },
    ],
  },
];

export type StaffMember = {
  name: string;
  credential: string;
  title: string;
  bio: string;
  initials: string;
  isOwner?: boolean;
  photo?: string;
};

export const staff: StaffMember[] = [
  {
    name: "Megan Evans",
    credential: "CNP",
    title: "Certified Nurse Practitioner",
    bio: "Megan brings a clinical eye and a warm, approachable style to every consultation — helping clients feel confident in their care from the very first visit.",
    initials: "ME",
    isOwner: true,
  },
  {
    name: "Ashley Robinson",
    credential: "APRN",
    title: "Advanced Practice Registered Nurse",
    bio: "Ashley's approach is rooted in safety, precision, and genuine connection — she believes every client deserves a provider who listens before treating.",
    initials: "AR",
    isOwner: true,
  },
  {
    name: "Rachel Kunkler",
    credential: "AE",
    title: "Advanced Esthetician",
    bio: "Rachel's deep knowledge of skin health means every treatment is thoughtful, precise, and tailored to what your skin actually needs.",
    initials: "RK",
  },
  {
    name: "Morgan Frost",
    credential: "LMT",
    title: "Licensed Massage Therapist",
    bio: "Morgan creates a space where clients feel genuinely cared for — her sessions are calm, attentive, and designed around your comfort and wellness goals.",
    initials: "MF",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "The staff is absolutely amazing. I've never been happier with my results. 10/10 recommend.",
    author: "Amber G.",
  },
  {
    quote: "These ladies are phenomenal at their work and make your experience great. I would recommend this place to anyone.",
    author: "Kaitlyn H.",
  },
  {
    quote: "I love the providers and everyone in there. It is such a welcoming environment, I will be back.",
    author: "Jodi A.",
  },
  {
    quote: "The staff is knowledgeable, professional, and genuinely cares about helping you look and feel your best.",
    author: "Jay H.",
  },
];

export const brandPrinciples = [
  "Consultation-led care — every service starts with a provider conversation, not a package upsell.",
  "Real results, real imagery — we use actual client photos, not stock photography.",
  "Your privacy matters — we never collect medical history or health information through this website.",
];
