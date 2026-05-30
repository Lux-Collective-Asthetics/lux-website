import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, HeartHandshake, Microscope, ShieldCheck, Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business, brandPrinciples } from "@/content/site";
import { media } from "@/content/media";
import { getBookingUrl } from "@/lib/booking";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about The Lux Collective Aesthetics & Wellness, a science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
  openGraph: {
    title: "About | The Lux Collective",
    description: "A science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
    url: "https://theluxcollectiveaesthetics.com/about",
  },
};

const specialists = [
  {
    role: "Aesthetic Injector",
    focus: "Botox, Dysport, Xeomin, Jeuveau, dermal filler",
    detail: "Facial balancing, soft movement, and natural-looking refresh plans.",
    icon: BadgeCheck,
  },
  {
    role: "Laser & Skin Specialist",
    focus: "IPL photo facials, laser hair removal, vein treatments",
    detail: "Technology-led treatments for clearer tone, texture, and confidence.",
    icon: Microscope,
  },
  {
    role: "Wellness Provider",
    focus: "Medical weight loss, HRT, regenerative services",
    detail: "Clinical support for clients who want care that goes beyond the surface.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  const bookingUrl = getBookingUrl();

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Welcome to The Lux
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Advanced aesthetics with a provider-first, human approach.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {business.shortName} is built for clients who want science-backed treatments, clear guidance, and an experience that feels calm from the first conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BookButton bookingUrl={bookingUrl} source="about" className="rounded-full" />
              <a
                href="/services"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View services
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr] sm:items-end">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-background">
              <Image
                src={media.lounge.src}
                alt={media.lounge.alt}
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background">
              <Image
                src={media.skinTreatment.src}
                alt={media.skinTreatment.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Our standard
            </p>
            <h2 className="mt-3 text-4xl text-primary">
              Built around trust before treatment.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {brandPrinciples.map((principle) => (
              <div key={principle} className="rounded-lg border border-border bg-card p-5">
                <ShieldCheck className="size-5 text-accent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
                Specialized people
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl">
                A team structure that helps clients find the right expert.
              </h2>
            </div>
            <p className="max-w-md text-sm text-primary-foreground/70">
              Staff profiles can be updated with real names, credentials, photos, and specialty details as soon as the team is ready to publish them.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {specialists.map((person) => {
              const Icon = person.icon;

              return (
                <article key={person.role} className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 p-5">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-3xl">{person.role}</h3>
                  <p className="mt-3 text-sm font-semibold text-champagne">{person.focus}</p>
                  <p className="mt-3 text-sm text-primary-foreground/70">{person.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
