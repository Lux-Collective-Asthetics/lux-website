"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, Info, X } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { Button } from "@/components/ui/button";
import type { Service, ServiceGroup } from "@/content/site";

type SelectedService = {
  group: ServiceGroup;
  service: Service;
};

type ServicesPricingSectionProps = {
  bookingUrl: string | null;
  serviceGroups: ServiceGroup[];
};

const categoryCopy: Record<string, string> = {
  Injectables: "Subtle structure, soft movement, and treatment plans built around your features.",
  "Laser Treatments": "Light and laser services for tone, hair reduction, visible veins, and clearer skin.",
  "Regenerative Treatments": "PRP-based options for texture, collagen support, hair restoration, and wellness goals.",
  Wellness: "Provider-led support for weight loss, hormone therapy, and select in-office procedures.",
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function priceLabel(price: string) {
  const [label, value] = price.split(": ");
  if (!value) {
    return { label: "Starting at", value: price };
  }

  return { label, value };
}

function detailCopy(service: Service, groupName: string) {
  const introByGroup: Record<string, string> = {
    Injectables:
      "Best for clients who want refreshed, natural-looking results with a conservative, provider-guided plan.",
    "Laser Treatments":
      "Best for clients who want targeted technology-based treatments for skin tone, unwanted hair, or visible veins.",
    "Regenerative Treatments":
      "Best for clients interested in PRP-supported renewal, collagen support, and consultation-led regenerative care.",
    Wellness:
      "Best for clients looking for provider-led support beyond the surface, with recommendations based on goals and clinical fit.",
  };

  return {
    intro: introByGroup[groupName] ?? "A consultation helps determine whether this service fits your goals.",
    note:
      "Final recommendations, treatment timing, and exact pricing are confirmed with the provider during your visit.",
    prep:
      service.duration
        ? `Plan for about ${service.duration}, plus any intake or consultation time.`
        : "Appointment timing may vary based on the treatment area and provider recommendation.",
  };
}

export function ServicesPricingSection({ bookingUrl, serviceGroups }: ServicesPricingSectionProps) {
  const [selected, setSelected] = useState<SelectedService | null>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {serviceGroups.map((group) => (
            <section
              key={group.name}
              aria-labelledby={`${slug(group.name)}-heading`}
              className="grid gap-4 lg:grid-cols-[220px_1fr]"
            >
              <div className="rounded-lg border border-border bg-primary p-4 text-primary-foreground shadow-sm lg:sticky lg:top-24 lg:self-start">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
                  Category
                </p>
                <h2 id={`${slug(group.name)}-heading`} className="mt-2 text-3xl">
                  {group.name}
                </h2>
                <p className="mt-3 text-xs leading-6 text-primary-foreground/75">
                  {categoryCopy[group.name] ?? "Consultation-led care with clear pricing."}
                </p>
                <p className="mt-4 border-t border-primary-foreground/15 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                  {group.services.length} services
                </p>
                <BookButton
                  bookingUrl={bookingUrl}
                  label={bookingUrl ? "Book" : "Ask"}
                  source={`services_${group.name.toLowerCase().replaceAll(" ", "_")}`}
                  className="mt-4 w-full !bg-primary-foreground !text-primary hover:!bg-primary-foreground/90"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.services.map((service) => (
                  <ServiceCard
                    key={service.name}
                    group={group}
                    service={service}
                    onSelect={() => setSelected({ group, service })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selected ? (
        <ServiceDetailsModal
          bookingUrl={bookingUrl}
          selected={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function ServiceCard({
  group,
  service,
  onSelect,
}: {
  group: ServiceGroup;
  service: Service;
  onSelect: () => void;
}) {
  return (
    <article className="flex min-h-[260px] flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent hover:bg-muted/60 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
            {group.name}
          </p>
          <h3 className="mt-2 text-2xl text-primary">{service.name}</h3>
        </div>
        {service.duration ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
            <Clock className="size-3" />
            {service.duration}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{service.summary}</p>
      <ServicePriceList service={service} />

      <Button
        type="button"
        variant="outline"
        className="mt-auto w-full justify-between"
        onClick={onSelect}
      >
        More details
        <Info data-icon="inline-end" className="size-4" />
      </Button>
    </article>
  );
}

function ServicePriceList({ service }: { service: Service }) {
  return (
    <div className="my-5 rounded-lg border border-border bg-background p-4">
      {service.priceLines.map((price) => {
        const item = priceLabel(price);

        return (
          <div
            key={price}
            className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 first:pt-0 last:border-0 last:pb-0"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {item.label}
            </span>
            <span className="text-right text-lg font-semibold text-primary">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function ServiceDetailsModal({
  bookingUrl,
  selected,
  onClose,
}: {
  bookingUrl: string | null;
  selected: SelectedService;
  onClose: () => void;
}) {
  const details = detailCopy(selected.service, selected.group.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/60 px-4 py-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-background shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              {selected.group.name}
            </p>
            <h2 id="service-details-title" className="mt-2 text-4xl text-primary">
              {selected.service.name}
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            <X className="size-5" />
          </Button>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-[1fr_240px]">
          <div>
            <p className="text-base text-muted-foreground">{selected.service.summary}</p>
            <p className="mt-4 text-sm text-muted-foreground">{details.intro}</p>

            <div className="mt-6 space-y-3">
              <DetailRow label="What to expect" value={details.prep} />
              <DetailRow label="Provider note" value={details.note} />
              <DetailRow
                label="Booking"
                value="Use the booking link when available, or send a general message for help choosing the right visit."
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Pricing
            </p>
            <ServicePriceList service={selected.service} />
            <BookButton
              bookingUrl={bookingUrl}
              label={bookingUrl ? "Book this service" : "Ask about this"}
              source={`service_modal_${selected.service.name.toLowerCase().replaceAll(" ", "_")}`}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-border p-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
            <ArrowRight data-icon="inline-end" className="size-4 rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
