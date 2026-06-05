"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { usePublicServiceCategories } from "@/lib/public-content-hooks";
import type { ServiceCategory } from "@/lib/types/db";

const IMG_PADDING = 12;

// Keyword → fallback image for each of the 3 hardcoded parallax sections
const SECTION_KEYWORDS: { keywords: string[]; fallback: string }[] = [
  { keywords: ["injectable"],              fallback: "/injectable-treatment.jpg" },
  { keywords: ["laser", "skin"],           fallback: "/laser-treatment.jpg" },
  { keywords: ["wellness", "weight", "hormone"], fallback: "/lounge.jpg" },
];

function resolveSection(categories: ServiceCategory[], index: number): string {
  const { keywords, fallback } = SECTION_KEYWORDS[index];
  const match = categories.find((c) =>
    keywords.some((k) => c.name.toLowerCase().includes(k))
  );
  return match?.image_url ?? fallback;
}

type Props = {
  initialCategories: ServiceCategory[];
};

export function LuxFeaturesScroll({ initialCategories }: Props) {
  const { data: categories } = usePublicServiceCategories(initialCategories);

  const injectablesImg  = resolveSection(categories, 0);
  const laserImg        = resolveSection(categories, 1);
  const wellnessImg     = resolveSection(categories, 2);

  return (
    <section className="bg-cream py-10 sm:py-14" aria-labelledby="signature-care-heading">
      <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
          Services
        </p>
        <h2 id="signature-care-heading" className="mt-3 max-w-4xl text-4xl text-primary sm:text-5xl">
          The treatments clients come back for, shown with a little more room to breathe.
        </h2>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          From subtle injectables to technology-led skin renewal and medical wellness, The Lux pairs clinical standards with a calm, personal experience.
        </p>
      </div>

      <TextParallaxContent
        imgSrc={injectablesImg}
        imgAlt="Injectable treatment at The Lux Collective"
        subheading="Injectables"
        heading="Results that look like you."
      >
        <InjectablesContent />
      </TextParallaxContent>

      <TextParallaxContent
        imgSrc={laserImg}
        imgAlt="Laser skin treatment at The Lux Collective"
        subheading="Laser & Skin"
        heading="Technology-led renewal."
      >
        <LaserContent />
      </TextParallaxContent>

      <TextParallaxContent
        imgSrc={wellnessImg}
        imgAlt="The Lux Collective med spa lounge"
        subheading="Medical Wellness"
        heading="Invest in how you feel."
      >
        <WellnessContent />
      </TextParallaxContent>
    </section>
  );
}

function TextParallaxContent({
  imgSrc,
  imgAlt,
  subheading,
  heading,
  children,
}: {
  imgSrc: string;
  imgAlt: string;
  subheading: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className="px-3">
      <div className="relative h-[140vh]">
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

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      ref={targetRef}
      style={{ height: `calc(100vh - ${IMG_PADDING * 2}px)`, top: IMG_PADDING, scale }}
      className="sticky z-0 overflow-hidden rounded-lg"
    >
      <div className="relative h-full w-full">
        <Image src={imgSrc} alt={imgAlt} fill className="object-cover" sizes="100vw" />
      </div>
      <motion.div className="absolute inset-0 bg-espresso/65" style={{ opacity }} />
    </motion.div>
  );
}

function OverlayCopy({ subheading, heading }: { subheading: string; heading: string }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [220, -220]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

  return (
    <motion.div
      ref={targetRef}
      style={{ y, opacity }}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center px-5 text-white"
    >
      <p className="mb-2 text-center text-base font-semibold uppercase tracking-[0.18em] text-champagne md:mb-4 md:text-2xl">
        {subheading}
      </p>
      <p className="font-heading max-w-4xl text-center text-5xl text-white sm:text-6xl md:text-7xl">
        {heading}
      </p>
    </motion.div>
  );
}

function InjectablesContent() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <h3 className="font-heading col-span-1 text-3xl text-primary md:col-span-4">
        Precision care,<br />your features.
      </h3>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-lg text-muted-foreground md:text-xl">
          Neuromodulator and dermal filler appointments soften fine lines and restore volume with a measured touch.
        </p>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Every injectable appointment starts with a provider consultation. The plan is built around your face, your goals, and your pace.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
      <h3 className="font-heading col-span-1 text-3xl text-primary md:col-span-4">
        Clinical tools,<br />visible results.
      </h3>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-lg text-muted-foreground md:text-xl">
          IPL photo facials help even tone and texture. Laser hair removal targets unwanted hair by treatment area, while leg vein treatments address visible veins with precision.
        </p>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Add a PRP Vampire Facial for collagen and renewal support, combining microneedling with your own growth factors for skin quality that builds over time.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
      <h3 className="font-heading col-span-1 text-3xl text-primary md:col-span-4">
        Whole-person<br />care, done right.
      </h3>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-lg text-muted-foreground md:text-xl">
          Medical weight loss and hormone replacement therapy are supervised by a provider and tailored around your labs, goals, and day-to-day life.
        </p>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          These are clinical care paths with real outcomes, delivered in a setting that actually feels good to be in. Every next step starts with a provider conversation.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Discover wellness <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
