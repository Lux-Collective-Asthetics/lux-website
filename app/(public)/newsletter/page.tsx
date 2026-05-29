import type { Metadata } from "next";

import { SubscribeForm } from "@/components/subscribe-form";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Stay in the loop on treatments, specials, and wellness tips from The Lux Collective.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
        Newsletter
      </p>
      <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
        Stay in the loop.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Occasional updates on new treatments, seasonal specials, and wellness tips — straight from the team. No spam, unsubscribe any time.
      </p>

      <div className="mt-10 max-w-sm">
        <SubscribeForm />
      </div>
    </div>
  );
}
