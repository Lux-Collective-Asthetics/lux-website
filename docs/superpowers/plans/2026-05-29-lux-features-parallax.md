# Lux Features Parallax Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-panel sticky parallax scroll "features" section to the homepage between the services bento grid and the testimonials marquee, showcasing Injectables, Laser & Skin, and Medical Wellness with tailored copy and local imagery.

**Architecture:** A single `LuxFeaturesScroll` client component in `components/ui/` wraps three `TextParallaxContent` panels — each with a sticky full-viewport image that scales/fades on scroll, an animated overlay heading, and a 2-column content block below with detailed copy and a CTA to `/services`. The component is imported into the homepage between the two existing `RevealSection` blocks.

**Tech Stack:** Next.js 16, React 19, motion/react (already installed as `motion@12`), lucide-react, Tailwind CSS 4, TypeScript

---

### Task 1: Create the parallax scroll component

**Files:**
- Create: `lux-collective/components/ui/text-parallax-scroll.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const IMG_PADDING = 12;

export function LuxFeaturesScroll() {
  return (
    <div className="bg-cream">
      <TextParallaxContent
        imgSrc="/injectable-treatment.jpg"
        imgAlt="Injectable treatment at The Lux Collective"
        subheading="Injectables"
        heading="Results that look like you."
      >
        <InjectablesContent />
      </TextParallaxContent>

      <TextParallaxContent
        imgSrc="/laser-treatment.jpg"
        imgAlt="Laser skin treatment at The Lux Collective"
        subheading="Laser & Skin"
        heading="Technology-led renewal."
      >
        <LaserContent />
      </TextParallaxContent>

      <TextParallaxContent
        imgSrc="/lounge.jpg"
        imgAlt="The Lux Collective med spa lounge"
        subheading="Medical Wellness"
        heading="Invest in how you feel."
      >
        <WellnessContent />
      </TextParallaxContent>
    </div>
  );
}

function TextParallaxContent({
  imgSrc, imgAlt, subheading, heading, children,
}: {
  imgSrc: string;
  imgAlt: string;
  subheading: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-[150vh]">
        <StickyImage imgSrc={imgSrc} imgAlt={imgAlt} />
        <OverlayCopy subheading={subheading} heading={heading} />
      </div>
      {children}
    </div>
  );
}

function StickyImage({ imgSrc, imgAlt }: { imgSrc: string; imgAlt: string }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      ref={targetRef}
      style={{ height: `calc(100vh - ${IMG_PADDING * 2}px)`, top: IMG_PADDING, scale }}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <Image src={imgSrc} alt={imgAlt} fill className="object-cover" sizes="100vw" />
      <motion.div className="absolute inset-0 bg-espresso/60" style={{ opacity }} />
    </motion.div>
  );
}

function OverlayCopy({ subheading, heading }: { subheading: string; heading: string }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      ref={targetRef}
      style={{ y, opacity }}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl font-semibold uppercase tracking-[0.18em] text-champagne md:mb-4 md:text-2xl">
        {subheading}
      </p>
      <p className="font-heading text-center text-4xl text-white md:text-7xl">{heading}</p>
    </motion.div>
  );
}

function InjectablesContent() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <h2 className="font-heading col-span-1 text-3xl text-primary md:col-span-4">
        Precision care,<br />your features.
      </h2>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-lg text-muted-foreground md:text-xl">
          Botox, Dysport, Xeomin, and Jeuveau starting at $10 per unit — relaxing fine lines and wrinkles with a light touch. Dermal fillers from $275 add volume and contour where it counts, without the overdone look.
        </p>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Every injectable appointment starts with a provider consultation. We don't sell packages or push treatments. We build a plan around your face, your goals, and your pace.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View injectables <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function LaserContent() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <h2 className="font-heading col-span-1 text-3xl text-primary md:col-span-4">
        Clinical tools,<br />visible results.
      </h2>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-lg text-muted-foreground md:text-xl">
          IPL photo facials from $150 even tone and texture. Laser hair removal targets unwanted hair by area — from $75 for small zones, up to $250 for large areas. Leg vein treatment addresses visible veins with precision, priced by count. All provider-supervised.
        </p>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Add a PRP Vampire Facial ($250) for deep collagen and renewal support — combining microneedling with your own growth factors for texture, tone, and skin quality that builds over time.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Explore treatments <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function WellnessContent() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <h2 className="font-heading col-span-1 text-3xl text-primary md:col-span-4">
        Whole-person<br />care, done right.
      </h2>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-lg text-muted-foreground md:text-xl">
          Medical weight loss with Semaglutide and Tirzepatide, supervised monthly by a provider. Hormone replacement therapy — pellet, oral, or injectable — tailored to your labs and your life from $75 per visit.
        </p>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          These aren't spa extras. They're clinical interventions with real outcomes, delivered in a setting that actually feels good to be in. Every care path starts with a provider conversation, not a sales pitch.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Discover wellness <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lux-collective/components/ui/text-parallax-scroll.tsx
git commit -m "feat: add LuxFeaturesScroll parallax component"
```

---

### Task 2: Wire component into the homepage

**Files:**
- Modify: `lux-collective/app/(public)/page.tsx`

- [ ] **Step 1: Add import at top of page.tsx**

Add after the existing imports:
```tsx
import { LuxFeaturesScroll } from "@/components/ui/text-parallax-scroll";
```

- [ ] **Step 2: Insert component between services bento and testimonials**

Replace the `{/* Testimonials */}` block so the file reads:

```tsx
      {/* Services bento */}
      <RevealSection ...>...</RevealSection>

      {/* Features parallax */}
      <LuxFeaturesScroll />

      {/* Testimonials */}
      <RevealSection>
        <TestimonialsMarquee testimonials={testimonials} />
      </RevealSection>
```

- [ ] **Step 3: Commit**

```bash
git add lux-collective/app/(public)/page.tsx
git commit -m "feat: add features parallax scroll to homepage between services and testimonials"
```
