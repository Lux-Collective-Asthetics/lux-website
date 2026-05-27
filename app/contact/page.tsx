import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Lux Collective Aesthetics & Wellness in Newark, Ohio for general inquiries.",
};

export default function ContactPage() {
  const bookingUrl = getBookingUrl();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
          Contact
        </p>
        <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
          Questions, booking help, or general inquiries.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Please keep messages general. Do not send medical history, symptoms, photos, treatment details, or other health information through this website.
        </p>
        <div className="mt-8">
          <BookButton
            bookingUrl={bookingUrl}
            label={bookingUrl ? "Open booking" : "Request booking help"}
            source="contact"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <a className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted" href={`mailto:${business.email}`}>
          <Mail className="size-5 text-accent" />
          <h2 className="mt-4 text-2xl text-primary">Email</h2>
          <p className="mt-2 text-sm text-muted-foreground">{business.email}</p>
        </a>
        <a className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted" href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`}>
          <Phone className="size-5 text-accent" />
          <h2 className="mt-4 text-2xl text-primary">Phone</h2>
          <p className="mt-2 text-sm text-muted-foreground">{business.phone}</p>
        </a>
        <div className="rounded-lg border border-border bg-card p-5">
          <MapPin className="size-5 text-accent" />
          <h2 className="mt-4 text-2xl text-primary">Location</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {business.address.street}
            <br />
            {business.address.city}, {business.address.state} {business.address.zip}
          </p>
        </div>
      </div>

      <section className="mt-10 rounded-lg border border-border bg-background p-6">
        <h2 className="text-3xl text-primary">Hours</h2>
        <ul className="mt-4 grid gap-2 text-muted-foreground sm:grid-cols-2">
          {business.hours.map((hour) => (
            <li key={hour}>{hour}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
