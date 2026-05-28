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
        name: "Botox",
        summary:
          "Wrinkle relaxer appointments using Botox, Dysport, Xeomin, or Jeuveau.",
        priceLines: ["$10 per unit"],
      },
      {
        name: "Dermal Filler",
        summary: "Volume and contour support with a personalized treatment plan.",
        priceLines: ["$550 per syringe", "$275 per half syringe"],
      },
    ],
  },
  {
    name: "Laser Treatments",
    services: [
      {
        name: "Laser Photo Facial",
        summary: "A light-based treatment for tone, clarity, and refreshed skin.",
        priceLines: ["1 session: $150", "2 sessions: $200"],
      },
      {
        name: "Laser Hair Removal",
        summary: "Targeted hair reduction by treatment area.",
        priceLines: [
          "Small area: face, under arms, beard - $75",
          "Medium area: arms, bikini, lower legs - $150",
          "Large area: back, full, chest - $250",
        ],
      },
      {
        name: "Laser Leg Vein Treatment",
        summary: "Laser treatment priced by the number of visible veins treated.",
        priceLines: [
          "1-10 veins: $100",
          "11-20 veins: $200",
          "21-30 veins: $300",
          "31+ veins: $400",
        ],
        duration: "20-60 min",
      },
    ],
  },
  {
    name: "Regenerative Treatments",
    services: [
      {
        name: "Vampire Facial",
        summary:
          "PRP facial treatment supporting collagen, texture, tone, and skin renewal.",
        priceLines: ["$250", "Add-on laser: $100"],
        duration: "60 min",
      },
      {
        name: "Facial Injections",
        summary: "PRP-based facial injection options customized to your goals.",
        priceLines: ["$150-$450"],
        duration: "60 min",
      },
      {
        name: "Hair Restoration",
        summary: "PRP hair restoration support for eligible clients.",
        priceLines: ["1 tube: $200", "2 tubes: $300"],
      },
      {
        name: "P-Shot / O-Shot",
        summary: "Consultation-led regenerative wellness treatments.",
        priceLines: ["P-Shot: $600", "O-Shot: $500"],
        duration: "60 min",
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
        name: "Hormone Replacement Therapy",
        summary: "Office visit and therapy options reviewed with a provider.",
        priceLines: [
          "Office visit: $75",
          "Pellet therapy: $350",
          "Oral/injectables: cost varies by insurance or cash pay",
        ],
        duration: "45 min",
      },
      {
        name: "Cyst I&D and Skin Lesion Removal",
        summary: "Consultation-led treatment; pricing varies by size, number, and location.",
        priceLines: ["Consultation: $25, applied toward same-day treatment"],
      },
    ],
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
  "Real results, real imagery — we use actual client photos; no stock photography or AI-generated visuals.",
  "Your privacy matters — we never collect medical history or health information through this website.",
];
