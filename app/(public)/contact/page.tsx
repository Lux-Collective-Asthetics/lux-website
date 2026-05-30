import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { business } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Lux Collective Aesthetics & Wellness in Newark, Ohio for general inquiries.",
};

export default function ContactPage() {
  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-[320px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-8 size-60 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-8 size-44 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Contact
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Questions, booking help, or <em>general inquiries.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Send a general message below. For appointments, use the booking link — or call during business hours.
            </p>
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ContactForm />

            <div className="space-y-4">
              <a
                className="flex gap-4 rounded-lg border border-border bg-background p-5 transition-colors hover:bg-muted"
                href={`mailto:${business.email}`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Mail className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Email</p>
                  <p className="mt-1 text-sm text-muted-foreground">{business.email}</p>
                </div>
              </a>

              <a
                className="flex gap-4 rounded-lg border border-border bg-background p-5 transition-colors hover:bg-muted"
                href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Phone className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Phone</p>
                  <p className="mt-1 text-sm text-muted-foreground">{business.phone}</p>
                </div>
              </a>

              <div className="flex gap-4 rounded-lg border border-border bg-background p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <MapPin className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Location</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {business.address.street}
                    <br />
                    {business.address.city}, {business.address.state} {business.address.zip}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-lg border border-border bg-background p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Clock className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Hours</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {business.hours.map((hour) => (
                      <li key={hour}>{hour}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
