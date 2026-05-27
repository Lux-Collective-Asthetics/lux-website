import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Lux Collective Aesthetics & Wellness updates and announcements.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
        Newsletter
      </p>
      <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
        Updates are coming after the launch foundation is live.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        The newsletter system is intentionally parked until the core marketing site, DNS move, and email sending domain are ready. No subscriber form is active yet, so no data is collected here.
      </p>
      <Link
        href="/contact"
        className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
      >
        Contact The Lux
      </Link>
    </div>
  );
}
