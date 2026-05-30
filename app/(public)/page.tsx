import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Mail, MapPin, Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { RevealSection } from "@/components/shared/reveal-section";
import { business, serviceGroups, testimonials } from "@/content/site";
import { media } from "@/content/media";
import { getBookingUrl } from "@/lib/booking";
import { siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

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
    url: siteUrl,
    type: "website",
    images: [{ url: `${siteUrl}/hero-med-spa.jpg`, width: 1200, height: 900, alt: "The Lux Collective Aesthetics & Wellness" }],
  },
  twitter: {
    card: "summary_large_image",
    title: business.name,
    description: business.description,
    images: [`${siteUrl}/hero-med-spa.jpg`],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: business.name,
  description: business.description,
  url: siteUrl,
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
  const featuredServices = serviceGroups.flatMap((group) => group.services).slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="relative flex min-h-120 items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-16 size-80 rounded-full bg-blush opacity-50" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-8 bottom-0 size-56 rounded-full bg-taupe opacity-35" />
        <div aria-hidden="true" className="pointer-events-none absolute right-1/4 top-1/3 size-44 rounded-full bg-blush opacity-40" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="lux-fade-in-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Newark, Ohio med spa
            </p>
            <h1 className="lux-fade-up-3 mt-5 text-5xl text-primary sm:text-6xl lg:text-7xl">
              Refined aesthetic care, grounded in <em>real results.</em>
            </h1>
            <p className="lux-fade-up-5 mt-6 max-w-xl text-lg text-muted-foreground">
              {business.description}
            </p>
            <div className="lux-fade-up-7 mt-8 flex flex-col gap-3 sm:flex-row">
              <BookButton bookingUrl={bookingUrl} source="home_hero" className="rounded-full" />
              <Link
                href="/services"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
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
        </div>
      </section>

      {/* Info strip */}
      <RevealSection className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="flex items-start gap-3 md:border-r md:border-border md:pr-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
              <MapPin className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Visit The Lux</p>
              <p className="text-sm text-muted-foreground">
                {business.address.street}, {business.address.city}, {business.address.state} {business.address.zip}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 md:border-r md:border-border md:px-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
              <Clock className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Current hours</p>
              <p className="text-sm text-muted-foreground">
                {business.hours?.join(" · ") ?? "Hours unavailable"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 md:pl-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
              <Mail className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-semibold">General inquiries</p>
              <a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={`mailto:${business.email}`}>
                {business.email}
              </a>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Services bento */}
      <RevealSection className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">Services</p>
            <h2 className="mt-3 text-4xl text-primary">A focused menu for skin, injectables, laser, and wellness.</h2>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Full menu <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-[auto_auto]">
          {featuredServices.map((service, i) => (
            <article
              key={service.name}
              className={cn(
                "rounded-lg border p-5 shadow-sm",
                i === 0
                  ? "border-transparent bg-primary text-primary-foreground md:row-span-2"
                  : "border-border bg-card transition-transform hover:-translate-y-1 hover:bg-muted"
              )}
            >
              <h3 className={cn("text-xl", i !== 0 && "text-primary")}>{service.name}</h3>
              <p className={cn("mt-3 text-sm", i === 0 ? "opacity-80" : "text-muted-foreground")}>{service.summary}</p>
              <p className={cn("mt-4 text-sm font-semibold", i !== 0 && "text-foreground")}>{service.priceLines[0]}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      {/* Staggered photo gallery */}
      <RevealSection className="mx-auto grid max-w-7xl gap-4 px-5 pb-14 sm:px-6 md:grid-cols-3 md:items-end lg:px-8">
        {[media.injectable, media.skinTreatment, media.laser].map((item, i) => (
          <div
            key={item.src}
            className={cn(
              "relative overflow-hidden rounded-lg border border-border bg-card",
              i === 1 ? "aspect-3/4 -mt-6" : "aspect-4/3"
            )}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </RevealSection>

      {/* Testimonials */}
      <RevealSection className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl text-4xl text-primary">Real relationships. Real reviews. Real imagery only.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 4).map((testimonial, i) => (
              <figure
                key={testimonial.author}
                className={cn(
                  "rounded-lg border border-border p-5",
                  i % 2 === 0 ? "bg-background" : "bg-card"
                )}
              >
                <span aria-hidden="true" className="block font-heading text-5xl leading-none text-accent opacity-60">&ldquo;</span>
                <blockquote className="mt-2 italic text-muted-foreground">{testimonial.quote}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">{testimonial.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </RevealSection>
    </>
  );
}
