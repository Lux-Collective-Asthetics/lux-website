import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business, brandPrinciples } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about The Lux Collective Aesthetics & Wellness — a science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
  openGraph: {
    title: "About | The Lux Collective",
    description: "A science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
    url: "https://theluxcollectiveaesthetics.com/about",
  },
};

export default function AboutPage() {
  const bookingUrl = getBookingUrl();

  return (
    <div>
      {/* Gradient hero */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-10 size-64 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 left-16 size-48 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Welcome to The Lux
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Premium med-spa care with a warm, <em>human center.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {business.shortName} specializes in results-driven treatments backed by science and delivered with precision. The experience is elevated, but the goal is simple: help every client feel informed, comfortable, and confident.
            </p>
            <div className="mt-8">
              <BookButton bookingUrl={bookingUrl} source="about" className="rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Brand principles */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-primary">Built around trust from the start.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {brandPrinciples.map((principle) => (
              <div key={principle} className="rounded-lg border border-border bg-background p-5">
                <div className="mb-3 h-0.5 w-7 rounded bg-accent" />
                <p className="text-sm font-medium text-muted-foreground">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
