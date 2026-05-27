import type { Metadata } from "next";

import { BookButton } from "@/components/book-button";
import { serviceGroups } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore services and pricing for The Lux Collective Aesthetics & Wellness in Newark, Ohio.",
};

export default function ServicesPage() {
  const bookingUrl = getBookingUrl();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
          Services and pricing
        </p>
        <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
          Treatment options for refreshed skin, natural structure, and wellness support.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Pricing is listed from the current public menu. Some treatments require consultation, and final recommendations are made by the provider.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {serviceGroups.map((group) => (
          <section key={group.name} aria-labelledby={`${group.name}-heading`}>
            <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-end">
              <h2 id={`${group.name}-heading`} className="text-3xl text-primary">
                {group.name}
              </h2>
              <BookButton
                bookingUrl={bookingUrl}
                label={bookingUrl ? "Book this service" : "Ask about booking"}
                source={`services_${group.name.toLowerCase().replaceAll(" ", "_")}`}
              />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.services.map((service) => (
                <article key={service.name} className="rounded-lg border border-border bg-card p-5 shadow-sm">
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
  );
}
