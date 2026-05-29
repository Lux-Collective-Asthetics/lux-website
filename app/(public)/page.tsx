import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business, serviceGroups, testimonials } from "@/content/site";
import { media } from "@/content/media";
import { getBookingUrl } from "@/lib/booking";

const BASE_URL = "https://theluxcollectiveaesthetics.com";

export const metadata: Metadata = {
  title: `${business.name} | Newark, Ohio Med Spa`,
  description: business.description,
  keywords: [
    "med spa Newark Ohio",
    "aesthetics Newark Ohio",
    "botox Newark Ohio",
    "laser treatment Newark Ohio",
    "medical weight loss Newark Ohio",
    "dermal filler Newark Ohio",
    "PRP facial Newark Ohio",
    "hormone replacement therapy Ohio",
  ],
  openGraph: {
    title: business.name,
    description: business.description,
    url: BASE_URL,
    type: "website",
    images: [{ url: `${BASE_URL}/hero-med-spa.jpg`, width: 1200, height: 900, alt: "The Lux Collective Aesthetics & Wellness" }],
  },
  twitter: {
    card: "summary_large_image",
    title: business.name,
    description: business.description,
    images: [`${BASE_URL}/hero-med-spa.jpg`],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: business.name,
  description: business.description,
  url: BASE_URL,
  telephone: business.phone,
  email: business.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: "US",
  },
  openingHours: ["Mo 09:00-15:00", "Tu 09:00-18:00", "We 09:00-15:00", "Th 09:00-15:00", "Fr 09:00-15:00", "Sa 09:00-12:00"],
  priceRange: "$$",
};

export default function Home() {
  const bookingUrl = getBookingUrl();
  const featuredServices = serviceGroups.flatMap((group) => group.services).slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:px-8 lg:py-18">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <Sparkles className="size-4 text-accent" />
            Newark, Ohio med spa
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl text-primary sm:text-6xl lg:text-7xl">
            Refined aesthetic care, grounded in real results.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {business.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BookButton bookingUrl={bookingUrl} source="home_hero" />
            <Link
              href="/services"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              View services
              <ArrowRight className="size-4" />
            </Link>
          </div>
          {!bookingUrl && (
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              Online booking coming soon —{" "}
              <a href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`} className="underline underline-offset-2">
                call us at {business.phone}
              </a>{" "}
              to schedule.
            </p>
          )}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Image
            src={media.hero.src}
            alt={media.hero.alt}
            fill
            priority
            sizes="(min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 text-accent" />
            <div>
              <p className="font-semibold">Visit The Lux</p>
              <p className="text-sm text-muted-foreground">
                {business.address.street}, {business.address.city}, {business.address.state} {business.address.zip}
              </p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Current hours</p>
            <p className="text-sm text-muted-foreground">
              {business.hours?.join(" · ") ?? "Hours unavailable"}
            </p>
          </div>
          <div>
            <p className="font-semibold">General inquiries</p>
            <a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={`mailto:${business.email}`}>
              {business.email}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">Services</p>
            <h2 className="mt-3 text-4xl text-primary">A focused menu for skin, injectables, laser, and wellness.</h2>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Full menu <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <article key={service.name} className="rounded-lg border border-border bg-background p-5 shadow-sm">
              <h3 className="text-xl text-primary">{service.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{service.summary}</p>
              <p className="mt-4 text-sm font-semibold text-foreground">{service.priceLines[0]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-14 sm:px-6 md:grid-cols-3 lg:px-8">
        {[media.injectable, media.skinTreatment, media.laser].map((item) => (
          <div key={item.src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl text-4xl text-primary">Real relationships. Real reviews. Real imagery only.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 4).map((testimonial) => (
              <figure key={testimonial.author} className="rounded-lg border border-border bg-background p-5">
                <blockquote className="text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">{testimonial.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
