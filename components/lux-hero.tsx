"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Clock, Mail, MapPin, Sparkles } from "lucide-react";

import { business } from "@/content/site";

const container: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.14 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const statsBlock: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
  },
};

export function LuxHero() {
  return (
    <section className="relative flex min-h-135 items-end overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-16 size-80 rounded-full bg-blush opacity-50" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-8 bottom-0 size-56 rounded-full bg-taupe opacity-35" />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/4 top-1/3 size-44 rounded-full bg-blush opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <motion.div variants={container} initial="hidden" animate="visible">

          {/* Two-column layout: text left, photo right */}
          <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left content */}
          <div>
            <motion.p
              variants={item}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground"
            >
              <Sparkles className="size-4 text-accent" aria-hidden="true" />
              Newark, Ohio med spa
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-5 text-5xl text-primary sm:text-6xl lg:text-7xl"
            >
              Refined aesthetic care, grounded in{" "}
              <em className="text-accent">real results.</em>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              {business.description}
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View services
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Contact us
              </Link>
            </motion.div>
          </div>{/* end left content */}

          {/* Right: hero photo */}
          <motion.div
            variants={item}
            className="relative hidden aspect-4/5 overflow-hidden rounded-2xl shadow-xl lg:block"
          >
            <Image
              src="/hero-med-spa.jpg"
              alt="The Lux Collective med spa treatment room"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 0vw"
              className="object-cover"
            />
            {/* subtle champagne vignette at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#f8f4ee]/30 to-transparent" />
          </motion.div>

          </div>{/* end two-column grid */}

          {/* Info bar */}
          <motion.div
            variants={statsBlock}
            className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 backdrop-blur-sm sm:grid-cols-3"
          >
            <motion.div variants={item} className="flex items-start gap-3 bg-background/60 p-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                <MapPin className="size-4 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">Visit The Lux</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {business.address.street}, {business.address.city}, {business.address.state} {business.address.zip}
                </p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-start gap-3 bg-background/60 p-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                <Clock className="size-4 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">Current hours</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {business.hours?.join(" · ") ?? "Hours unavailable"}
                </p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-start gap-3 bg-background/60 p-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                <Mail className="size-4 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">General inquiries</p>
                <a
                  href={`mailto:${business.email}`}
                  className="mt-1 block text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {business.email}
                </a>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
