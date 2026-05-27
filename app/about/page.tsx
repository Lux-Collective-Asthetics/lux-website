import type { Metadata } from "next";
import Image from "next/image";

import { BookButton } from "@/components/book-button";
import { media } from "@/content/media";
import { business, brandPrinciples } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about The Lux Collective Aesthetics & Wellness, a luxe medical spa in Newark, Ohio.",
};

export default function AboutPage() {
  const bookingUrl = getBookingUrl();

  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            Welcome to The Lux
          </p>
          <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
            Premium med-spa care with a warm, human center.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {business.shortName} specializes in results-driven treatments backed by science and delivered with precision. The experience is elevated, but the goal is simple: help every client feel informed, comfortable, and confident.
          </p>
          <div className="mt-8">
            <BookButton bookingUrl={bookingUrl} source="about" />
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Image
            src={media.lounge.src}
            alt={media.lounge.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-primary">Built around trust from the start.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {brandPrinciples.map((principle) => (
              <div key={principle} className="rounded-lg border border-border bg-background p-5">
                <p className="text-sm font-medium text-muted-foreground">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
