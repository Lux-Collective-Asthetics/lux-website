import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Clock,
  Gem,
  Layers3,
  Sparkles,
} from "lucide-react";

import { serviceGroups, type Service } from "@/content/site";

export const metadata: Metadata = {
  title: "Services Mockups",
  description: "Service card and pricing layout mockups for The Lux Collective.",
  robots: { index: false, follow: false },
};

const featuredServices = serviceGroups.flatMap((group) =>
  group.services.map((service) => ({ ...service, groupName: group.name }))
);

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function primaryPrice(service: Service) {
  return service.priceLines[0]?.replace(/^1 session: /, "") ?? "Consultation";
}

function priceLabel(price: string) {
  const [label, value] = price.split(": ");
  if (!value) {
    return { label: "Starting at", value: label };
  }

  return { label, value };
}

export default function ServicesMocksPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <Sparkles className="size-4 text-accent" />
            Services mockups
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl text-primary sm:text-6xl">
            Three ways to make the pricing menu feel more polished.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            These are design directions using the real service names and prices. Pick the vibe, then I can apply it to the real `/services` page.
          </p>
        </div>
      </section>

      <MockOne />
      <MockTwo />
      <MockThree />
    </div>
  );
}

function MockHeader({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            {number} / {eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl text-primary">{title}</h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function MockOne() {
  return (
    <section className="py-14">
      <MockHeader
        number="01"
        eyebrow="Editorial cards"
        title="Big category moments with clean treatment cards."
        description="Best if you want the page to feel high-end and spacious, with each service category getting its own mini-feature."
      />

      <div className="mx-auto mt-8 max-w-7xl space-y-8 px-5 sm:px-6 lg:px-8">
        {serviceGroups.map((group) => (
          <section key={group.name} className="grid gap-5 lg:grid-cols-[0.85fr_1.4fr]">
            <div className="rounded-lg border border-border bg-primary p-6 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                Treatment category
              </p>
              <h3 className="mt-3 text-4xl">{group.name}</h3>
              <p className="mt-4 text-sm text-primary-foreground/75">
                Consultation-led recommendations, transparent pricing, and a calm provider experience from start to finish.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary"
              >
                Ask about {group.name.toLowerCase()} <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {group.services.map((service) => (
                <article key={service.name} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
                        {group.name}
                      </p>
                      <h4 className="mt-2 text-2xl text-primary">{service.name}</h4>
                    </div>
                    {service.duration ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
                        <Clock className="size-3" />
                        {service.duration}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{service.summary}</p>
                  <div className="mt-5 rounded-lg border border-border bg-background p-4">
                    {service.priceLines.map((price) => {
                      const item = priceLabel(price);

                      return (
                        <div key={price} className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="text-right text-lg font-semibold text-primary">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function MockTwo() {
  return (
    <section className="border-y border-border bg-card py-14">
      <MockHeader
        number="02"
        eyebrow="Menu board"
        title="Compact, scannable, and very clear on price."
        description="Best if people are coming to compare pricing quickly. This feels more clinical and direct, but still polished."
      />

      <div className="mx-auto mt-8 grid max-w-7xl gap-6 px-5 lg:grid-cols-[220px_1fr] sm:px-6 lg:px-8">
        <aside className="hidden self-start rounded-lg border border-border bg-background p-4 lg:sticky lg:top-24 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            Jump to
          </p>
          <div className="mt-4 space-y-2">
            {serviceGroups.map((group) => (
              <a
                key={group.name}
                href={`#mock-${slug(group.name)}`}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {group.name}
              </a>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          {serviceGroups.map((group) => (
            <section key={group.name} id={`mock-${slug(group.name)}`} className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex flex-col gap-2 border-b border-border bg-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-3xl text-primary">{group.name}</h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  {group.services.length} treatments
                </span>
              </div>

              <div className="divide-y divide-border">
                {group.services.map((service) => (
                  <article key={service.name} className="grid gap-4 p-5 md:grid-cols-[1fr_280px] md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-2xl text-primary">{service.name}</h4>
                        {service.duration ? (
                          <span className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground">
                            {service.duration}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{service.summary}</p>
                    </div>
                    <div className="rounded-lg bg-card p-3">
                      {service.priceLines.map((price) => (
                        <div key={price} className="flex justify-between gap-4 py-1.5 text-sm">
                          <span className="text-muted-foreground">{priceLabel(price).label}</span>
                          <span className="text-right font-semibold text-primary">{priceLabel(price).value}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function MockThree() {
  return (
    <section className="py-14">
      <MockHeader
        number="03"
        eyebrow="Premium catalog"
        title="A boutique service catalog with bold price anchors."
        description="Best if you want a modern card grid that feels upscale but still easy to browse on mobile."
      />

      <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredServices.map((service) => (
            <article key={`${service.groupName}-${service.name}`} className="group flex min-h-[320px] flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                  <Gem className="size-3.5" />
                  {service.groupName}
                </span>
                {service.duration ? (
                  <span className="text-xs font-semibold text-muted-foreground">{service.duration}</span>
                ) : null}
              </div>

              <h3 className="mt-5 text-3xl text-primary">{service.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{service.summary}</p>

              <div className="mt-auto pt-6">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <BadgeDollarSign className="size-4 text-accent" />
                    Starts at
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-primary">{primaryPrice(service)}</p>
                  {service.priceLines.length > 1 ? (
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      {service.priceLines.slice(1).map((price) => (
                        <p key={price} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Layers3 className="mt-1 size-3.5 shrink-0 text-accent" />
                          {price}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <Link
                  href="/contact"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90"
                >
                  Ask about this service <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
