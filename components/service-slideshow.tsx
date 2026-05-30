"use client";

import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
} from "@/components/ui/animated-slideshow";

const SLIDES = [
  { id: "injectables",   title: "Injectables",           imageUrl: "/injectable-treatment.jpg" },
  { id: "laser",         title: "Laser Treatments",       imageUrl: "/laser-treatment.jpg" },
  { id: "regenerative",  title: "Regenerative",           imageUrl: "/skin-treatment.jpg" },
  { id: "wellness",      title: "Wellness",               imageUrl: "/hero-med-spa.jpg" },
];

export function ServiceSlideshow() {
  return (
    <HoverSlider className="px-5 py-12 sm:px-6 lg:px-8 bg-[var(--cream)]">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--champagne)]">
        / our services
      </p>
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-col space-y-3 md:space-y-5">
          {SLIDES.map((slide, index) => (
            <TextStaggerHover
              key={slide.id}
              index={index}
              text={slide.title}
              className="cursor-pointer font-heading text-4xl font-bold uppercase tracking-tight text-[var(--espresso)] md:text-5xl"
            />
          ))}
        </div>

        <HoverSliderImageWrap className="w-full max-w-sm sm:w-auto">
          {SLIDES.map((slide, index) => (
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
