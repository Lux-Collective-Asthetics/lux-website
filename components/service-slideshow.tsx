"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  useHoverSliderContext,
} from "@/components/ui/animated-slideshow";
import { usePublicServiceCategories } from "@/lib/public-content-hooks";
import type { ServiceCategory } from "@/lib/types/db";
import type { ServiceGroup } from "@/content/site";

const STATIC_SLIDES = [
  { id: "injectables",  title: "Injectables",      imageUrl: "/injectable-treatment.jpg" },
  { id: "laser",        title: "Laser Treatments",  imageUrl: "/laser-treatment.jpg" },
  { id: "regenerative", title: "Regenerative",      imageUrl: "/skin-treatment.jpg" },
  { id: "wellness",     title: "Wellness",           imageUrl: "/hero-med-spa.jpg" },
];

const KEYWORD_FALLBACKS: { keywords: string[]; image: string }[] = [
  { keywords: ["injectable"],                                       image: "/injectable-treatment.jpg" },
  { keywords: ["laser"],                                            image: "/laser-treatment.jpg" },
  { keywords: ["regenerative", "prp", "facial", "eye", "wax"],     image: "/skin-treatment.jpg" },
  { keywords: ["wellness", "weight", "hormone", "hrt", "massage"],  image: "/hero-med-spa.jpg" },
];

function resolveImage(category: ServiceCategory): string {
  if (category.image_url) return category.image_url;
  const lower = category.name.toLowerCase();
  const match = KEYWORD_FALLBACKS.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match?.image ?? "/hero-med-spa.jpg";
}

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

type Props = {
  initialCategories: ServiceCategory[];
  initialServiceGroups: ServiceGroup[];
};

export function ServiceSlideshow({ initialCategories, initialServiceGroups }: Props) {
  const router = useRouter();
  const { data: categories } = usePublicServiceCategories(initialCategories);

  const visibleCategories = categories.filter((c) => !c.is_system);

  const slides =
    visibleCategories.length > 0
      ? visibleCategories.map((cat) => ({
          id: cat.id,
          title: cat.name,
          imageUrl: resolveImage(cat),
        }))
      : STATIC_SLIDES;

  function handleCategoryClick(title: string) {
    const slug = categorySlug(title);
    router.replace(`/services?category=${slug}`, { scroll: false });
    setTimeout(() => {
      document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <HoverSlider className="px-5 py-12 sm:px-6 lg:px-8 bg-cream">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-champagne">
        / our services
      </p>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[256px_1fr]">
        <div className="flex flex-col justify-center space-y-1">
          {slides.map((slide, index) => (
            <CategoryItem
              key={slide.id}
              index={index}
              title={slide.title}
              onClick={() => handleCategoryClick(slide.title)}
            />
          ))}
        </div>

        <HoverSliderImageWrap
          className="rounded-lg overflow-hidden"
          style={{ height: "clamp(260px, 45vw, 520px)" }}
        >
          {slides.map((slide, index) => (
            <HoverSliderImage
              key={slide.id}
              index={index}
              imageUrl={slide.imageUrl}
              src={slide.imageUrl}
              alt={slide.title}
              className="object-contain"
              loading="eager"
              decoding="async"
              style={{ width: "100%", height: "100%" }}
            />
          ))}
        </HoverSliderImageWrap>
      </div>

      <PreviewStrip
        slides={slides}
        serviceGroups={initialServiceGroups}
        onViewAll={handleCategoryClick}
      />
    </HoverSlider>
  );
}

function CategoryItem({
  index,
  title,
  onClick,
}: {
  index: number;
  title: string;
  onClick: () => void;
}) {
  const { activeSlide, changeSlide } = useHoverSliderContext();
  const isActive = activeSlide === index;

  return (
    <button
      type="button"
      onMouseEnter={() => changeSlide(index)}
      onClick={onClick}
      className={`text-left font-heading text-3xl font-bold uppercase tracking-tight transition-opacity duration-200 md:text-4xl ${
        isActive ? "opacity-100 text-espresso" : "opacity-30 text-espresso hover:opacity-70"
      }`}
    >
      {title}
    </button>
  );
}

function PreviewStrip({
  slides,
  serviceGroups,
  onViewAll,
}: {
  slides: { id: string; title: string; imageUrl: string }[];
  serviceGroups: ServiceGroup[];
  onViewAll: (title: string) => void;
}) {
  const { activeSlide } = useHoverSliderContext();
  const activeTitle = slides[activeSlide]?.title ?? "";
  const activeGroup = serviceGroups.find((g) => g.name === activeTitle);

  if (!activeGroup || activeGroup.services.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTitle}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="mt-6 border-t border-border pt-4"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {activeTitle}
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {activeGroup.services.slice(0, 6).map((service) => (
            <div
              key={service.name}
              className="shrink-0 rounded-lg border border-border bg-card px-4 py-3 min-w-35"
            >
              <p className="text-sm font-semibold text-foreground line-clamp-1">{service.name}</p>
              {service.summary && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{service.summary}</p>
              )}
              {service.priceLines[0] && (
                <p className="mt-1 text-xs font-medium text-accent-foreground">{service.priceLines[0]}</p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onViewAll(activeTitle)}
            className="shrink-0 rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/80 self-stretch flex items-center"
          >
            View all →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
