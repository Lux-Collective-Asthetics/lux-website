import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { media } from "@/content/media";
import { serviceGroups } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";
import { cn } from "@/lib/utils";

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

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ServicesPage() {
  const bookingUrl = getBookingUrl();

  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
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

      {/* Staggered photo row */}
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:px-6 md:grid-cols-3 md:items-end lg:px-8">
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
      </div>

      {/* Service groups */}
      <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {serviceGroups.map((group) => (
            <section key={group.name} aria-labelledby={`${slug(group.name)}-heading`}>
              <div className="relative flex flex-col justify-between gap-3 pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">The Lux Collective</p>
                  <h2 id={`${slug(group.name)}-heading`} className="text-3xl text-primary">
                    {group.name}
                  </h2>
                </div>
                <BookButton
                  bookingUrl={bookingUrl}
                  label={bookingUrl ? "Book this service" : "Ask about booking"}
                  source={`services_${group.name.toLowerCase().replaceAll(" ", "_")}`}
                  className="rounded-full"
                />
                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-champagne via-taupe to-transparent" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <article key={service.name} className="rounded-lg border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-1 hover:bg-muted">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl text-primary">{service.name}</h3>
                      {service.duration ? (
                        <span className="rounded-md bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {service.duration}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{service.summary}</p>
                    <ul className="mt-5 space-y-2 text-sm font-medium">
                      {service.priceLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
