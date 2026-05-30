"use client";

import React from "react";
import { motion } from "motion/react";

import type { Testimonial } from "@/content/site";

function Initials({ name }: { name: string }) {
  const parts = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--champagne)] text-sm font-bold text-[var(--espresso)] ring-2 ring-[var(--taupe)]"
    >
      {letters}
    </div>
  );
}

function TestimonialsColumn({
  testimonials,
  duration = 15,
  className,
}: {
  testimonials: Testimonial[];
  duration?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <motion.ul
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="m-0 flex list-none flex-col gap-5 p-0 pb-5"
      >
        {[0, 1].map((pass) =>
          testimonials.map(({ quote, author }, i) => (
            <motion.li
              key={`${pass}-${i}`}
              aria-hidden={pass === 1 ? "true" : "false"}
              tabIndex={pass === 1 ? -1 : 0}
              whileHover={{ scale: 1.03, y: -6, transition: { type: "spring", stiffness: 400, damping: 17 } }}
              className="w-full max-w-xs cursor-default select-none rounded-2xl border border-[var(--border)] bg-card p-7 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--champagne)]/40"
            >
              <blockquote className="m-0 p-0">
                <p className="m-0 leading-relaxed text-muted-foreground">{quote}</p>
                <footer className="mt-5 flex items-center gap-3">
                  <Initials name={author} />
                  <cite className="not-italic font-semibold tracking-tight text-[var(--espresso)]">
                    {author}
                  </cite>
                </footer>
              </blockquote>
            </motion.li>
          ))
        )}
      </motion.ul>
    </div>
  );
}

export function TestimonialsMarquee({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-secondary/50 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="inline-block rounded-full border border-[var(--border)] bg-background px-4 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Testimonials
          </span>
          <h2 id="testimonials-heading" className="mt-5 text-4xl text-primary">
            Real relationships. Real reviews.
          </h2>
          <p className="mt-3 max-w-sm text-muted-foreground">
            What our clients say after their visits.
          </p>
        </div>

        <div
          className="flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] max-h-[680px] overflow-hidden"
          role="region"
          aria-label="Scrolling client testimonials"
        >
          <TestimonialsColumn testimonials={testimonials} duration={15} />
          <TestimonialsColumn testimonials={testimonials} duration={19} className="hidden md:block" />
          <TestimonialsColumn testimonials={testimonials} duration={17} className="hidden lg:block" />
        </div>
      </motion.div>
    </section>
  );
}
