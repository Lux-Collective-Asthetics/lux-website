"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Service, ServiceGroup } from "@/content/site";

type SelectedService = {
  group: ServiceGroup;
  service: Service;
};

type ServicesPricingSectionProps = {
  serviceGroups: ServiceGroup[];
  initialActiveCategory?: string;
};

const categoryCopy: Record<string, string> = {
  Injectables:       "Subtle structure, soft movement, and treatment plans built around your features.",
  PRP:               "Platelet-rich plasma treatments for skin renewal, hair restoration, and regenerative wellness.",
  HRT:               "Hormone replacement therapy reviewed with a provider — oral, injectable, or pellet options.",
  "Laser Treatments": "Laser services for hair reduction, photofacial resurfacing, and clearer skin.",
  Massage:           "Therapeutic and relaxation massage tailored to your comfort and wellness goals.",
  Facials:           "Medical-grade skin treatments targeting hydration, clarity, aging, and texture.",
  "Eye Enhancements": "Lash and brow services for defined, polished eyes with lasting results.",
  Waxing:            "Smooth, precise hair removal and back facial treatments.",
  Wellness:          "Provider-led support for weight loss and select in-office procedures.",
};

function categorySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
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
    PRP:
      "Best for clients interested in PRP-supported renewal, collagen stimulation, hair restoration, or regenerative wellness.",
    HRT:
      "Best for clients seeking hormone balance support — a provider consultation confirms the right approach for your goals.",
    "Laser Treatments":
      "Best for clients who want targeted laser-based treatments for hair reduction, skin resurfacing, or pigment concerns.",
    Massage:
      "Best for clients looking to relieve tension, support recovery, or simply set aside time for rest and renewal.",
    Facials:
      "Best for clients who want medical-grade skin care tailored to their skin type, concerns, and lifestyle.",
    "Eye Enhancements":
      "Best for clients who want polished, defined eyes without the daily effort — results that last weeks.",
    Waxing:
      "Best for clients who want smooth, clean results with minimal downtime.",
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

export function ServicesPricingSection({ serviceGroups, initialActiveCategory }: ServicesPricingSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<SelectedService | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const urlCategory = searchParams.get("category");
  const defaultSlug = serviceGroups[0] ? categorySlug(serviceGroups[0].name) : "";
  const activeSlug = urlCategory ?? initialActiveCategory ?? defaultSlug;
  const activeGroup =
    serviceGroups.find((g) => categorySlug(g.name) === activeSlug) ?? serviceGroups[0];

  function selectCategory(groupName: string) {
    router.replace(`/services?category=${categorySlug(groupName)}`, { scroll: false });
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <nav className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Categories
            </p>
            <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              {serviceGroups.map((group) => {
                const isActive = categorySlug(group.name) === activeSlug;
                return (
                  <button
                    key={group.name}
                    type="button"
                    onClick={() => selectCategory(group.name)}
                    className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {group.name}
                  </button>
                );
              })}
            </div>
          </nav>

          <div>
            {activeGroup ? (
              <>
                <div className="mb-4">
                  <h2 className="text-3xl text-primary">{activeGroup.name}</h2>
                  {categoryCopy[activeGroup.name] && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {categoryCopy[activeGroup.name]}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                    {activeGroup.services.length} services
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeGroup.services.map((service) => (
                    <ServiceCard
                      key={service.name}
                      group={activeGroup}
                      service={service}
                      onSelect={() => setSelected({ group: activeGroup, service })}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {selected ? (
        <ServiceDetailsModal selected={selected} onClose={() => setSelected(null)} />
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
      {service.priceLines.map((price, index) => {
        const item = priceLabel(price);
        return (
          <div
            key={index}
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
  selected,
  onClose,
}: {
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
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Pricing
            </p>
            <ServicePriceList service={selected.service} />
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
