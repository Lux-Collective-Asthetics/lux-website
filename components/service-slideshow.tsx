"use client";

import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
} from "@/components/ui/animated-slideshow";
import { usePublicServiceCategories } from "@/lib/public-content-hooks";
import type { ServiceCategory } from "@/lib/types/db";

// Static fallback slides shown when DB categories are empty / migration not yet run
const STATIC_SLIDES = [
  { id: "injectables",  title: "Injectables",      imageUrl: "/injectable-treatment.jpg" },
  { id: "laser",        title: "Laser Treatments",  imageUrl: "/laser-treatment.jpg" },
  { id: "regenerative", title: "Regenerative",      imageUrl: "/skin-treatment.jpg" },
  { id: "wellness",     title: "Wellness",          imageUrl: "/hero-med-spa.jpg" },
];

// Keyword → fallback image for categories without a custom image_url
const KEYWORD_FALLBACKS: { keywords: string[]; image: string }[] = [
  { keywords: ["injectable"],                          image: "/injectable-treatment.jpg" },
  { keywords: ["laser", "skin"],                       image: "/laser-treatment.jpg" },
  { keywords: ["regenerative", "prp"],                 image: "/skin-treatment.jpg" },
  { keywords: ["wellness", "weight", "hormone"],       image: "/hero-med-spa.jpg" },
];

function resolveImage(category: ServiceCategory): string {
  if (category.image_url) return category.image_url;
  const lower = category.name.toLowerCase();
  const match = KEYWORD_FALLBACKS.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match?.image ?? "/hero-med-spa.jpg";
}

type Props = {
  initialCategories: ServiceCategory[];
};

export function ServiceSlideshow({ initialCategories }: Props) {
  const { data: categories } = usePublicServiceCategories(initialCategories);

  const slides =
    categories.length > 0
      ? categories.map((cat) => ({
          id: cat.id,
          title: cat.name,
          imageUrl: resolveImage(cat),
        }))
      : STATIC_SLIDES;

  return (
    <HoverSlider className="px-5 py-12 sm:px-6 lg:px-8 bg-cream">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-champagne">
        / our services
      </p>
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-col space-y-3 md:space-y-5">
          {slides.map((slide, index) => (
            <TextStaggerHover
              key={slide.id}
              index={index}
              text={slide.title}
              className="cursor-pointer font-heading text-4xl font-bold uppercase tracking-tight text-espresso md:text-5xl"
            />
          ))}
        </div>

        <HoverSliderImageWrap className="w-full max-w-sm sm:w-auto">
          {slides.map((slide, index) => (
            <div key={slide.id}>
              <HoverSliderImage
                index={index}
                imageUrl={slide.imageUrl}
                src={slide.imageUrl}
                alt={slide.title}
                className="size-full max-h-96 rounded-lg object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          ))}
        </HoverSliderImageWrap>
      </div>
    </HoverSlider>
  );
}
