# Services Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the slideshow and services grid into a category-filter experience driven by URL search params, replace the character-by-character hover animation with plain hoverable category names + image + quick-preview strip, and give the admin page category tabs with safe deletion (reassign or fallback to "Other").

**Architecture:** `?category=<slug>` in the URL is the single source of truth for which category is active. The rebuilt slideshow sets this param on click and smooth-scrolls to the grid. The grid reads the param via `useSearchParams()` and renders only the matching category. The admin mirrors the same tab-filter pattern. A DB migration adds `category_id` (UUID FK) to `services` and `is_system` to `service_categories`, enabling safe category deletion that reassigns services instead of orphaning them.

**Tech Stack:** Next.js 16 App Router (`force-dynamic`), Supabase (service role client), Framer Motion (`motion/react`), React Query, Tailwind CSS, TypeScript

---

### Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/005_services_category_id.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/005_services_category_id.sql` with this content:

```sql
-- Migration 005: is_system flag on service_categories + category_id FK on services

-- 1. Add is_system to service_categories (default false for existing rows)
alter table service_categories
  add column if not exists is_system boolean not null default false;

-- 2. Ensure the "Other" system fallback category exists
insert into service_categories (name, display_order, is_system)
select 'Other', 9999, true
where not exists (
  select 1 from service_categories where name = 'Other' and is_system = true
);

-- 3. Add category_id FK to services (nullable initially so backfill can run)
alter table services
  add column if not exists category_id uuid references service_categories(id) on delete set null;

-- 4. Backfill category_id by matching existing category text to category name
update services s
set category_id = sc.id
from service_categories sc
where sc.name = s.category
  and s.category_id is null;

-- 5. Any still-null category_id → assign to "Other"
update services s
set category_id = (select id from service_categories where name = 'Other' limit 1)
where s.category_id is null;
```

- [ ] **Step 2: Run the migration in Supabase**

Open Supabase Dashboard → SQL Editor, paste and run the file. Then verify:

```sql
select name, is_system, display_order from service_categories order by display_order;
select id, name, category, category_id from services limit 10;
```

Expected: "Other" row with `is_system = true` and `display_order = 9999`. Every service row has a non-null `category_id`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/005_services_category_id.sql
git commit -m "db: add is_system to service_categories and category_id FK to services"
```

---

### Task 2: Update TypeScript Types and Server Actions

**Files:**
- Modify: `lib/types/db.ts`
- Modify: `app/admin/(protected)/services/actions.ts`

- [ ] **Step 1: Update `ServiceCategory` and `DbService` types**

In `lib/types/db.ts`, update the two types:

```typescript
export type ServiceCategory = {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
  is_system: boolean;
  created_at: string;
};

export type DbService = {
  id: string;
  name: string;
  summary: string;
  category: string;
  category_id: string | null;
  duration: string | null;
  hero_image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
};
```

- [ ] **Step 2: Update `createService` to accept and store `category_id`**

In `actions.ts`, replace the `createService` function:

```typescript
export async function createService(data: {
  name: string;
  summary: string;
  category: string;
  category_id: string;
  duration: string;
  hero_image_url: string;
}): Promise<DbService> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: maxRow } = await supabase
    .from("services")
    .select("display_order")
    .eq("category_id", data.category_id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? maxRow.display_order + 1 : 0;

  const { data: inserted, error } = await supabase
    .from("services")
    .insert({
      name: data.name,
      summary: data.summary,
      category: data.category,
      category_id: data.category_id,
      duration: data.duration || null,
      hero_image_url: data.hero_image_url || null,
      display_order: nextOrder,
      is_visible: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateServicePages();
  return inserted as DbService;
}
```

- [ ] **Step 3: Replace `deleteServiceCategory` and add `getServiceCountByCategory`**

In `actions.ts`, replace `deleteServiceCategory` and append `getServiceCountByCategory`:

```typescript
export async function getServiceCountByCategory(categoryId: string): Promise<number> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function deleteServiceCategory(
  id: string,
  reassignToId?: string
) {
  await requireAdmin();
  const supabase = createServiceClient();

  // Guard: never delete a system category
  const { data: cat, error: catError } = await supabase
    .from("service_categories")
    .select("is_system, name")
    .eq("id", id)
    .single();
  if (catError) throw new Error(catError.message);
  if (cat.is_system) throw new Error("Cannot delete a system category");

  // Resolve the target for orphaned services
  let targetId = reassignToId;
  let targetName = "Other";
  if (!targetId) {
    const { data: other } = await supabase
      .from("service_categories")
      .select("id, name")
      .eq("is_system", true)
      .limit(1)
      .maybeSingle();
    targetId = other?.id;
    targetName = other?.name ?? "Other";
  } else {
    const { data: targetCat } = await supabase
      .from("service_categories")
      .select("name")
      .eq("id", targetId)
      .single();
    targetName = targetCat?.name ?? "Other";
  }

  if (targetId) {
    const { error: updateError } = await supabase
      .from("services")
      .update({ category_id: targetId, category: targetName })
      .eq("category_id", id);
    if (updateError) throw new Error(updateError.message);
  }

  const { error } = await supabase.from("service_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
  revalidatePath("/admin/services");
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd lux-collective && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors introduced by these changes.

- [ ] **Step 5: Commit**

```bash
git add lib/types/db.ts app/admin/(protected)/services/actions.ts
git commit -m "feat: category_id + is_system types, safe deleteServiceCategory with reassignment"
```

---

### Task 3: Clean Up Animated Slideshow — Export Hook, Remove TextStaggerHover

**Files:**
- Modify: `components/ui/animated-slideshow.tsx`

- [ ] **Step 1: Remove `TextStaggerHover` and `splitText`, export `useHoverSliderContext`**

Replace the full file with:

```typescript
"use client";

import * as React from "react";
import { HTMLMotionProps, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface HoverSliderImageProps {
  index: number;
  imageUrl: string;
}

interface HoverSliderContextValue {
  activeSlide: number;
  changeSlide: (index: number) => void;
}

const HoverSliderContext = React.createContext<HoverSliderContextValue | undefined>(undefined);

export function useHoverSliderContext() {
  const ctx = React.useContext(HoverSliderContext);
  if (!ctx) throw new Error("useHoverSliderContext must be used within HoverSlider");
  return ctx;
}

export const HoverSlider = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ children, className, ...props }, ref) => {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const changeSlide = React.useCallback((i: number) => setActiveSlide(i), []);
  return (
    <HoverSliderContext.Provider value={{ activeSlide, changeSlide }}>
      <div ref={ref as React.Ref<HTMLDivElement>} className={className} {...props}>{children}</div>
    </HoverSliderContext.Provider>
  );
});
HoverSlider.displayName = "HoverSlider";

export const clipPathVariants = {
  visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
  hidden:  { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0px)" },
};

export const HoverSliderImageWrap = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid overflow-hidden *:col-start-1 *:col-end-1 *:row-start-1 *:row-end-1 *:size-full",
      className
    )}
    {...props}
  />
));
HoverSliderImageWrap.displayName = "HoverSliderImageWrap";

export const HoverSliderImage = React.forwardRef<
  HTMLImageElement,
  HTMLMotionProps<"img"> & HoverSliderImageProps
>(({ index, imageUrl, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext();
  return (
    <motion.img
      src={imageUrl}
      className={cn("inline-block align-middle", className)}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
      variants={clipPathVariants}
      animate={activeSlide === index ? "visible" : "hidden"}
      ref={ref}
      {...props}
    />
  );
});
HoverSliderImage.displayName = "HoverSliderImage";
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: if anything imports `TextStaggerHover`, it will error here — fix those imports before proceeding (the next task rewrites service-slideshow.tsx which was the only consumer).

- [ ] **Step 3: Commit**

```bash
git add components/ui/animated-slideshow.tsx
git commit -m "refactor: remove TextStaggerHover, export useHoverSliderContext"
```

---

### Task 4: Rebuild ServiceSlideshow

**Files:**
- Modify: `components/service-slideshow.tsx`

- [ ] **Step 1: Replace the full file**

```typescript
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
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
  { id: "injectables",  title: "Injectables",     imageUrl: "/injectable-treatment.jpg" },
  { id: "laser",        title: "Laser Treatments", imageUrl: "/laser-treatment.jpg" },
  { id: "regenerative", title: "Regenerative",     imageUrl: "/skin-treatment.jpg" },
  { id: "wellness",     title: "Wellness",         imageUrl: "/hero-med-spa.jpg" },
];

const KEYWORD_FALLBACKS: { keywords: string[]; image: string }[] = [
  { keywords: ["injectable"],                                       image: "/injectable-treatment.jpg" },
  { keywords: ["laser"],                                            image: "/laser-treatment.jpg" },
  { keywords: ["regenerative", "prp", "facial", "eye", "wax"],     image: "/skin-treatment.jpg" },
  { keywords: ["wellness", "weight", "hormone", "hrt", "massage"], image: "/hero-med-spa.jpg" },
];

function resolveImage(category: ServiceCategory): string {
  if (category.image_url) return category.image_url;
  const lower = category.name.toLowerCase();
  const match = KEYWORD_FALLBACKS.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match?.image ?? "/hero-med-spa.jpg";
}

export function categorySlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Slide = { id: string; title: string; imageUrl: string; slug: string };

type Props = {
  initialCategories: ServiceCategory[];
  initialServiceGroups: ServiceGroup[];
};

export function ServiceSlideshow({ initialCategories, initialServiceGroups }: Props) {
  const router = useRouter();
  const { data: categories } = usePublicServiceCategories(initialCategories);

  const visibleCategories = categories.filter((c) => !c.is_system);

  const slides: Slide[] =
    visibleCategories.length > 0
      ? visibleCategories.map((cat) => ({
          id: cat.id,
          title: cat.name,
          imageUrl: resolveImage(cat),
          slug: categorySlug(cat.name),
        }))
      : STATIC_SLIDES.map((s) => ({ ...s, slug: categorySlug(s.title) }));

  const handleCategoryClick = useCallback(
    (slug: string) => {
      router.replace(`/services?category=${slug}`, { scroll: false });
      setTimeout(() => {
        document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    },
    [router]
  );

  return (
    <HoverSlider className="px-5 py-10 sm:px-6 lg:px-8 bg-cream">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-champagne">
        / our services
      </p>

      <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-10">
        {/* Left: hoverable category names */}
        <CategoryList slides={slides} onCategoryClick={handleCategoryClick} />

        {/* Right: image panel — clip-path reveal on hover */}
        <HoverSliderImageWrap
          className="hidden md:block rounded-lg overflow-hidden shrink-0"
          style={{ width: "300px", height: "320px" }}
        >
          {slides.map((slide, index) => (
            <HoverSliderImage
              key={slide.id}
              index={index}
              imageUrl={slide.imageUrl}
              src={slide.imageUrl}
              alt={slide.title}
              className="size-full object-cover"
              loading="eager"
              decoding="async"
            />
          ))}
        </HoverSliderImageWrap>
      </div>

      {/* Quick-preview strip — fades in when a category is hovered */}
      <PreviewStrip slides={slides} serviceGroups={initialServiceGroups} onCategoryClick={handleCategoryClick} />
    </HoverSlider>
  );
}

function CategoryList({
  slides,
  onCategoryClick,
}: {
  slides: Slide[];
  onCategoryClick: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col justify-center gap-1">
      {slides.map((slide, index) => (
        <CategoryItem
          key={slide.id}
          index={index}
          title={slide.title}
          slug={slide.slug}
          onCategoryClick={onCategoryClick}
        />
      ))}
    </div>
  );
}

function CategoryItem({
  index,
  title,
  slug,
  onCategoryClick,
}: {
  index: number;
  title: string;
  slug: string;
  onCategoryClick: (slug: string) => void;
}) {
  const { activeSlide, changeSlide } = useHoverSliderContext();
  const isActive = activeSlide === index;

  return (
    <button
      type="button"
      className={cn(
        "text-left font-heading text-3xl tracking-tight transition-colors duration-150 md:text-4xl",
        isActive ? "text-espresso" : "text-espresso/35 hover:text-espresso/65"
      )}
      onMouseEnter={() => changeSlide(index)}
      onClick={() => onCategoryClick(slug)}
    >
      {title}
    </button>
  );
}

function PreviewStrip({
  slides,
  serviceGroups,
  onCategoryClick,
}: {
  slides: Slide[];
  serviceGroups: ServiceGroup[];
  onCategoryClick: (slug: string) => void;
}) {
  const { activeSlide } = useHoverSliderContext();
  const activeSlideData = slides[activeSlide];
  const activeGroup = serviceGroups.find(
    (g) => categorySlug(g.name) === activeSlideData?.slug
  );

  return (
    <AnimatePresence mode="wait">
      {activeGroup ? (
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-6 border-t border-espresso/10 pt-5"
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {activeGroup.services.map((service) => {
              const firstPrice = service.priceLines[0];
              const priceDisplay = firstPrice
                ? (firstPrice.includes(": ") ? firstPrice.split(": ")[1] : firstPrice)
                : null;
              return (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => onCategoryClick(activeSlideData!.slug)}
                  className="shrink-0 w-44 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-accent hover:bg-muted/50"
                >
                  <p className="text-sm font-semibold text-primary line-clamp-1">{service.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{service.summary}</p>
                  {priceDisplay ? (
                    <p className="mt-1.5 text-xs font-semibold text-accent-foreground">{priceDisplay}</p>
                  ) : null}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onCategoryClick(activeSlideData!.slug)}
              className="shrink-0 w-36 rounded-lg border border-dashed border-border bg-muted/20 p-3 flex flex-col items-center justify-center gap-1 transition-colors hover:bg-muted/50"
            >
              <span className="text-xs font-semibold text-muted-foreground">View all →</span>
              <span className="text-xs text-muted-foreground">{activeGroup.services.length} services</span>
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/service-slideshow.tsx
git commit -m "feat: rebuild ServiceSlideshow with category hover list and quick-preview strip"
```

---

### Task 5: Update Public Services Page — searchParams + Pass serviceGroups to Slideshow

**Files:**
- Modify: `app/(public)/services/page.tsx`

- [ ] **Step 1: Update `ServicesPage` to accept searchParams and pass serviceGroups to slideshow**

Replace the file content:

```typescript
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { PublicServicesPricing } from "@/components/public-services-pricing";
import { ServiceSlideshow } from "@/components/service-slideshow";
import { createClient } from "@/lib/supabase/server";
import { serviceGroups as defaultServiceGroups } from "@/content/site";
import type { ServiceGroup, Service } from "@/content/site";
import type { ServiceCategory } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Full services and pricing for The Lux Collective Aesthetics & Wellness in Newark, Ohio — injectables, laser treatments, PRP, medical weight loss, and more.",
  keywords: [
    "botox Newark Ohio",
    "dermal filler Newark Ohio",
    "laser hair removal Newark Ohio",
    "laser photo facial Newark Ohio",
    "vampire facial PRP Newark Ohio",
    "medical weight loss semaglutide Ohio",
    "hormone replacement therapy Ohio",
    "med spa services Newark Ohio",
  ],
  openGraph: {
    title: "Services & Pricing | The Lux Collective",
    description: "Injectables, laser treatments, PRP, weight loss, and hormone therapy in Newark, Ohio.",
    url: "https://theluxcollectiveaesthetics.com/services",
  },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: initialCategory } = await searchParams;

  let serviceGroups: ServiceGroup[] = [];
  let serviceCategories: ServiceCategory[] = [];
  let shouldUseFallback = false;

  try {
    const supabase = await createClient();
    const [{ data: dbServices, error }, categoriesRes] = await Promise.all([
      supabase
        .from("services")
        .select("*, service_price_lines(*)")
        .eq("is_visible", true)
        .order("display_order"),
      supabase
        .from("service_categories")
        .select("*")
        .order("display_order"),
    ]);

    if (!categoriesRes.error) {
      serviceCategories = (categoriesRes.data ?? []) as ServiceCategory[];
    }

    if (error) {
      shouldUseFallback = true;
    } else if (dbServices) {
      const grouped: Record<string, ServiceGroup> = {};
      for (const svc of dbServices) {
        if (!grouped[svc.category]) {
          grouped[svc.category] = { name: svc.category, services: [] };
        }
        const sortedPrices = [...(svc.service_price_lines as { label: string; price: string; display_order: number }[])]
          .sort((a, b) => a.display_order - b.display_order);
        const service: Service = {
          name: svc.name,
          summary: svc.summary,
          duration: svc.duration ?? undefined,
          priceLines: sortedPrices.map((pl) => pl.price ? `${pl.label}: ${pl.price}` : pl.label),
        };
        grouped[svc.category].services.push(service);
      }
      serviceGroups.push(...Object.values(grouped));
    }
  } catch {
    shouldUseFallback = true;
  }

  if (shouldUseFallback && serviceGroups.length === 0) {
    serviceGroups = defaultServiceGroups;
  }

  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-95 items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-12 size-72 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-12 size-52 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Services and pricing
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Treatment options for refreshed skin, natural structure, and <em>wellness support.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Pricing is listed from the current public menu. Some treatments require consultation, and final recommendations are made by the provider.
            </p>
          </div>
        </div>
      </section>

      {/* Service category slideshow */}
      <div className="mx-auto max-w-7xl">
        <ServiceSlideshow
          initialCategories={serviceCategories}
          initialServiceGroups={serviceGroups}
        />
      </div>

      {/* Anchor for scroll-to from slideshow clicks */}
      <div id="services-grid" />

      {/* Service groups — filtered by URL ?category param */}
      <PublicServicesPricing
        initialServiceGroups={serviceGroups}
        initialActiveCategory={initialCategory}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors about `initialActiveCategory` not existing on `PublicServicesPricing` yet — that's fine, fixed in the next task.

- [ ] **Step 3: Commit after next task is done (Task 6 depends on this)**

Hold the commit — do Task 6 first.

---

### Task 6: Add Category Filter to PublicServicesPricing + ServicesPricingSection

**Files:**
- Modify: `components/public-services-pricing.tsx`
- Modify: `components/services-pricing-section.tsx`

- [ ] **Step 1: Update `PublicServicesPricing` to pass `initialActiveCategory`**

Replace `components/public-services-pricing.tsx`:

```typescript
"use client";

import { ServicesPricingSection } from "@/components/services-pricing-section";
import type { ServiceGroup } from "@/content/site";
import { usePublicServiceGroups } from "@/lib/public-content-hooks";

export function PublicServicesPricing({
  initialServiceGroups,
  initialActiveCategory,
}: {
  initialServiceGroups: ServiceGroup[];
  initialActiveCategory?: string;
}) {
  const { data: serviceGroups } = usePublicServiceGroups(initialServiceGroups);

  if (serviceGroups.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Services are being updated. Check back soon.</p>
      </div>
    );
  }

  return (
    <ServicesPricingSection
      serviceGroups={serviceGroups}
      initialActiveCategory={initialActiveCategory}
    />
  );
}
```

- [ ] **Step 2: Rewrite `ServicesPricingSection` with sidebar filter**

Replace everything before the `ServiceCard` function in `components/services-pricing-section.tsx` (lines 1–139). Keep `ServiceCard`, `ServicePriceList`, `ServiceDetailsModal`, and `DetailRow` unchanged. The new top section:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import type { Service, ServiceGroup } from "@/content/site";

type SelectedService = {
  group: ServiceGroup;
  service: Service;
};

type ServicesPricingSectionProps = {
  serviceGroups: ServiceGroup[];
  initialActiveCategory?: string;
};

const categoryCopy: Record<string, string> = {
  Injectables:        "Subtle structure, soft movement, and treatment plans built around your features.",
  PRP:                "Platelet-rich plasma treatments for skin renewal, hair restoration, and regenerative wellness.",
  HRT:                "Hormone replacement therapy reviewed with a provider — oral, injectable, or pellet options.",
  "Laser Treatments": "Laser services for hair reduction, photofacial resurfacing, and clearer skin.",
  Massage:            "Therapeutic and relaxation massage tailored to your comfort and wellness goals.",
  Facials:            "Medical-grade skin treatments targeting hydration, clarity, aging, and texture.",
  "Eye Enhancements": "Lash and brow services for defined, polished eyes with lasting results.",
  Waxing:             "Smooth, precise hair removal and back facial treatments.",
  Wellness:           "Provider-led support for weight loss and select in-office procedures.",
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function priceLabel(price: string) {
  const [label, value] = price.split(": ");
  if (!value) return { label: "Starting at", value: price };
  return { label, value };
}

// ... (keep detailCopy unchanged from the original)

export function ServicesPricingSection({ serviceGroups, initialActiveCategory }: ServicesPricingSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<SelectedService | null>(null);

  // Derive the active category slug from URL param, then prop, then first group
  const urlCategory = searchParams.get("category");
  const defaultSlug = serviceGroups[0] ? slug(serviceGroups[0].name) : "";
  const activeSlug = urlCategory ?? initialActiveCategory ?? defaultSlug;

  const activeGroup =
    serviceGroups.find((g) => slug(g.name) === activeSlug) ?? serviceGroups[0];

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  function selectCategory(groupName: string) {
    router.replace(`/services?category=${slug(groupName)}`, { scroll: false });
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          {/* Sidebar: all categories */}
          <nav className="lg:sticky lg:top-24 lg:self-start flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
            {serviceGroups.map((group) => (
              <button
                key={group.name}
                type="button"
                onClick={() => selectCategory(group.name)}
                className={cn(
                  "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  slug(group.name) === activeSlug
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                )}
              >
                {group.name}
                <span className="ml-1.5 text-xs opacity-60">({group.services.length})</span>
              </button>
            ))}
          </nav>

          {/* Active category services */}
          {activeGroup ? (
            <section aria-labelledby="active-category-heading">
              <div className="mb-6">
                <h2 id="active-category-heading" className="text-3xl text-primary">
                  {activeGroup.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {categoryCopy[activeGroup.name] ?? "Consultation-led care with clear pricing."}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                  {activeGroup.services.length} {activeGroup.services.length === 1 ? "service" : "services"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeGroup.services.map((service) => (
                  <ServiceCard
                    key={service.name}
                    group={activeGroup}
                    service={service}
                    onSelect={() => setSelected({ group: activeGroup, service })}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {selected ? (
        <ServiceDetailsModal selected={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}
```

Note: keep `detailCopy`, `ServiceCard`, `ServicePriceList`, `ServiceDetailsModal`, and `DetailRow` exactly as they are in the original file. Only the export function `ServicesPricingSection` and the imports at the top change.

- [ ] **Step 3: Commit Tasks 5 + 6 together**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

```bash
git add app/\(public\)/services/page.tsx components/public-services-pricing.tsx components/services-pricing-section.tsx
git commit -m "feat: services page category filter via URL search params with sidebar nav"
```

---

### Task 7: Create DeleteCategoryModal

**Files:**
- Create: `components/admin/DeleteCategoryModal.tsx`

- [ ] **Step 1: Write the modal component**

Create `components/admin/DeleteCategoryModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceCategory } from "@/lib/types/db";

type Props = {
  category: ServiceCategory;
  serviceCount: number;
  otherCategories: ServiceCategory[];
  onConfirm: (reassignToId?: string) => Promise<void>;
  onCancel: () => void;
};

export function DeleteCategoryModal({
  category,
  serviceCount,
  otherCategories,
  onConfirm,
  onCancel,
}: Props) {
  const [reassignToId, setReassignToId] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm(reassignToId || undefined);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-cat-title"
        className="w-full max-w-md rounded-lg border border-border bg-background shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <h2 id="delete-cat-title" className="text-xl text-primary">
            Delete &ldquo;{category.name}&rdquo;?
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel">
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {serviceCount > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                This category has <strong>{serviceCount}</strong>{" "}
                {serviceCount === 1 ? "service" : "services"}. Choose where to move them,
                or leave blank to send them to <strong>Other</strong>.
              </p>
              <div>
                <label htmlFor="reassign-select" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Move services to
                </label>
                <select
                  id="reassign-select"
                  value={reassignToId}
                  onChange={(e) => setReassignToId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Other (system fallback)</option>
                  {otherCategories
                    .filter((c) => c.id !== category.id && !c.is_system)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This category has no services. It will be deleted immediately.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border p-5">
          <Button type="button" variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete category"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/DeleteCategoryModal.tsx
git commit -m "feat: DeleteCategoryModal with service reassignment dropdown"
```

---

### Task 8: Update Admin ServicesClient — Category Tabs, Scoped Add, is_system Guard

**Files:**
- Modify: `app/admin/(protected)/services/ServicesClient.tsx`
- Modify: `app/admin/(protected)/services/page.tsx`

- [ ] **Step 1: Update `ServicesClient` Props type, form types, and state**

At the top of `ServicesClient.tsx`, add import:

```typescript
import { DeleteCategoryModal } from "@/components/admin/DeleteCategoryModal";
```

Change `onDeleteCategory` in the `Props` type:

```typescript
onDeleteCategory: (id: string, reassignToId?: string) => Promise<void>;
```

Update `NewServiceForm` type to include `category_id`:

```typescript
type NewServiceForm = {
  name: string; summary: string; category: string;
  category_id: string; duration: string; hero_image_url: string;
};
```

Update `emptyNewService` to include `category_id`:

```typescript
const emptyNewService: NewServiceForm = {
  name: "", summary: "", category: "", category_id: "", duration: "", hero_image_url: "",
};
```

Add new state variables after the existing state declarations:

```typescript
const [activeAdminCategory, setActiveAdminCategory] = useState<string>(
  () => localCategories.find((c) => !c.is_system)?.name ?? localCategories[0]?.name ?? ""
);
const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<ServiceCategory | null>(null);
const [deleteCategoryCount, setDeleteCategoryCount] = useState(0);
```

- [ ] **Step 2: Replace the rendered category management + services list**

Find the section in `ServicesClient` where `groupedCategories` is mapped to render service groups (the `return (...)` block). Replace the entire return with the new layout. The key structural changes are:

1. **Category tabs** replace the old headings
2. **Services list** is filtered to `activeAdminCategory`
3. **Delete button** for non-system categories opens `DeleteCategoryModal`
4. **Add Service** button pre-fills the active category

Add these helper functions before the return statement:

```typescript
const filteredServices = localServices.filter(
  (s) => s.category === activeAdminCategory
);

const activeCategoryObj = localCategories.find((c) => c.name === activeAdminCategory);

async function handleDeleteCategory(id: string, reassignToId?: string) {
  await onDeleteCategory(id, reassignToId);
  // Move tab to first non-system category after deletion
  const remaining = localCategories.filter((c) => c.id !== id);
  setLocalCategories(remaining);
  const nextActive = remaining.find((c) => !c.is_system)?.name ?? "";
  setActiveAdminCategory(nextActive);
  setDeleteCategoryTarget(null);
}

async function handleInitiateDeleteCategory(cat: ServiceCategory) {
  // Count services in this category locally
  const count = localServices.filter((s) => s.category === cat.name).length;
  setDeleteCategoryCount(count);
  setDeleteCategoryTarget(cat);
}
```

In the JSX, add category tabs at the top of the rendered output (after the "Manage Categories" collapsible panel):

```typescript
{/* Category tabs */}
<div className="flex flex-wrap gap-2 border-b border-border pb-4">
  {localCategories.map((cat) => (
    <button
      key={cat.id}
      type="button"
      onClick={() => setActiveAdminCategory(cat.name)}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        activeAdminCategory === cat.name
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-primary"
      )}
    >
      {cat.name}
      {cat.is_system && (
        <span className="ml-1.5 rounded bg-muted-foreground/20 px-1 py-0.5 text-[10px] uppercase tracking-wide">
          system
        </span>
      )}
      <span className="ml-1.5 opacity-60 text-xs">
        ({localServices.filter((s) => s.category === cat.name).length})
      </span>
    </button>
  ))}
</div>

{/* Active category header + services */}
<div>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-primary">{activeAdminCategory}</h2>
    <div className="flex gap-2">
      {activeCategoryObj && !activeCategoryObj.is_system && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => handleInitiateDeleteCategory(activeCategoryObj)}
        >
          Delete category
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setNewForm({ ...emptyNewService, category: activeAdminCategory });
          setShowNewForm(true);
        }}
      >
        <Plus className="size-4 mr-1" /> Add Service
      </Button>
    </div>
  </div>

  {/* Services list (existing rendering logic, but using filteredServices) */}
  {/* Replace the old groupedCategories.map(...) rendering with filteredServices.map(...) */}
  {filteredServices.map((service) => (
    // ... existing service row rendering, unchanged
  ))}
</div>
```

Note: The existing service row rendering (edit/delete/visibility toggle inline forms) should be kept exactly as-is — just change the data source from all services grouped by category to `filteredServices`.

- [ ] **Step 3: Add DeleteCategoryModal to the return JSX**

At the end of the return statement, after the existing confirm-delete dialog, add:

```typescript
{deleteCategoryTarget ? (
  <DeleteCategoryModal
    category={deleteCategoryTarget}
    serviceCount={deleteCategoryCount}
    otherCategories={localCategories}
    onConfirm={(reassignToId) => handleDeleteCategory(deleteCategoryTarget.id, reassignToId)}
    onCancel={() => setDeleteCategoryTarget(null)}
  />
) : null}
```

- [ ] **Step 4: Update admin `page.tsx` to pass the updated `onDeleteCategory`**

In `app/admin/(protected)/services/page.tsx`, the `onDeleteCategory={deleteServiceCategory}` line already works because the action signature is backward-compatible (added an optional second parameter). No change needed to `page.tsx`.

Also add import of `getServiceCountByCategory` in case it's needed later — it's not needed in `page.tsx` since the count is computed client-side in the modal setup.

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/admin/\(protected\)/services/ServicesClient.tsx
git commit -m "feat: admin services category tabs, scoped add, and DeleteCategoryModal integration"
```

---

### Task 9: End-to-End Verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify the public services page**

Open `http://localhost:3000/services`.

Check:
- Slideshow renders with category names as plain text buttons (no character animation)
- Hovering a category name highlights it and swaps the image (clip-path reveal)
- Quick-preview strip appears below with service cards (name, summary, price)
- Clicking a preview card or category name updates URL to `?category=<slug>` and smooth-scrolls to the grid
- The grid sidebar highlights the matching category
- Only that category's services are shown in the grid
- Clicking a sidebar category updates the URL and filters the grid
- Detail modal still opens on service card click

- [ ] **Step 3: Verify the admin services page**

Open `http://localhost:3000/admin/services`.

Check:
- Category tabs appear across the top
- Clicking a tab filters the services list to that category
- "Add Service" button pre-fills the category of the active tab
- "Delete category" button is absent on the "Other" tab (system badge shown instead)
- Clicking "Delete category" on a non-system category with services shows the `DeleteCategoryModal`
- Selecting a target category and confirming reassigns services and removes the tab
- Leaving blank and confirming moves services to "Other"
- Category image upload still works in the "Manage Categories" panel

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: post-verification cleanup if any"
```
