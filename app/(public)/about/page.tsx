import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business, brandPrinciples, staff } from "@/content/site";
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
            Meet the team
          </p>
          <h2 className="mt-3 max-w-xl text-4xl">
            The people behind every treatment.
          </h2>

          <div className="mt-8 flex flex-col gap-4">
            {staff.map((member) => (
              <article
                key={member.name}
                className="flex gap-5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 p-5"
              >
                <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-sm font-semibold tracking-wide text-champagne">
                  {member.initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary-foreground">
                      {member.name}, {member.credential}
                    </h3>
                    {member.isOwner && (
                      <span className="rounded border border-champagne/30 bg-champagne/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-champagne">
                        Co-owner
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                    {member.title}
                  </p>
                  <p className="mt-3 text-sm text-primary-foreground/70">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
