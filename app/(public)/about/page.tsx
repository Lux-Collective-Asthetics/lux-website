import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business, brandPrinciples, staff as defaultStaff } from "@/content/site";
import { media } from "@/content/media";
import { getBookingUrl } from "@/lib/booking";
import { createClient } from "@/lib/supabase/server";
import type { StaffMember } from "@/lib/types/db";

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


export default async function AboutPage() {
  const bookingUrl = getBookingUrl();

  let staff = [] as StaffMember[];
  try {
    const supabase = await createClient();
    const { data: staffData, error } = await supabase
      .from("staff_members")
      .select("*")
      .eq("is_visible", true)
      .order("display_order");

    if (!error) {
      staff = (staffData ?? []) as StaffMember[];
    }
  } catch {
    staff = [];
  }

  if (staff.length === 0) {
    staff = defaultStaff.map((member, index) => ({
      id: `static-${index}`,
      name: member.name,
      credential: member.credential,
      title: member.title,
      bio: member.bio,
      photo_url: member.photo ?? null,
      booking_url: null,
      display_order: index,
      is_visible: true,
      created_at: new Date().toISOString(),
    }));
  }

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
            <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-border bg-background">
              <Image
                src={media.lounge.src}
                alt={media.lounge.alt}
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-border bg-background">
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

      {staff.length > 0 && (
        <section className="border-y border-border bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
              Meet the team
            </p>
            <h2 className="mt-3 max-w-xl text-4xl">
              The people behind every treatment.
            </h2>

            <div className="mt-8 flex flex-col gap-4">
              {staff.map((member) => {
                const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <article
                    key={member.id}
                    className="flex gap-5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 p-5"
                  >
                    <div className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-foreground/10 text-sm font-semibold tracking-wide text-champagne">
                      {member.photo_url ? (
                        <Image
                          src={member.photo_url}
                          alt={member.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-primary-foreground">
                          {member.name}, {member.credential}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                        {member.title}
                      </p>
                      <p className="mt-3 text-sm text-primary-foreground/70">{member.bio}</p>
                      {member.booking_url && (
                        <a
                          href={member.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center rounded-full border border-champagne/30 bg-champagne/10 px-4 py-1.5 text-xs font-medium text-champagne transition-colors hover:bg-champagne/20"
                        >
                          Book with {member.name.split(" ")[0]}
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
