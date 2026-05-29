import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

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
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            Contact
          </p>
          <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
            Questions, booking help, or general inquiries.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Send a general message below. For appointments, use the booking link — or call during business hours.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ContactForm />

          <div className="space-y-4">
            <a
              className="flex gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted"
              href={`mailto:${business.email}`}
            >
              <Mail className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold text-primary">Email</p>
                <p className="mt-1 text-sm text-muted-foreground">{business.email}</p>
              </div>
            </a>

            <a
              className="flex gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted"
              href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`}
            >
              <Phone className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold text-primary">Phone</p>
                <p className="mt-1 text-sm text-muted-foreground">{business.phone}</p>
              </div>
            </a>

            <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold text-primary">Location</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {business.address.street}
                  <br />
                  {business.address.city}, {business.address.state} {business.address.zip}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
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
    </>
  );
}
