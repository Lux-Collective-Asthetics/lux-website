import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { ServiceSlideshow } from "@/components/service-slideshow";
import { ServicesPricingSection } from "@/components/services-pricing-section";
import { getBookingUrl } from "@/lib/booking";
import { createClient } from "@/lib/supabase/server";
import { serviceGroups as staticServiceGroups } from "@/content/site";
import type { ServiceGroup, Service } from "@/content/site";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Full services and pricing for The Lux Collective Aesthetics & Wellness in Newark, Ohio — injectables, laser treatments, PRP, medical weight loss, and more.",
  keywords: [
    "botox Newark Ohio",
    "dermal filler Newark Ohio",
    "laser hair removal Newark Ohio",
    "laser photo facial Newark Ohio",
    "vampire facial PRP Newark Ohio",
    "medical weight loss semaglutide Ohio",
    "hormone replacement therapy Ohio",
    "med spa services Newark Ohio",
  ],
  openGraph: {
    title: "Services & Pricing | The Lux Collective",
    description: "Injectables, laser treatments, PRP, weight loss, and hormone therapy in Newark, Ohio.",
    url: "https://theluxcollectiveaesthetics.com/services",
  },
};

export default async function ServicesPage() {
  const bookingUrl = getBookingUrl();

  const supabase = await createClient();
  const { data: dbServices } = await supabase
    .from("services")
    .select("*, service_price_lines(*)")
    .eq("is_visible", true)
    .order("display_order");

  let serviceGroups = staticServiceGroups;

  if (dbServices && dbServices.length > 0) {
    const grouped: Record<string, ServiceGroup> = {};
    for (const svc of dbServices) {
      if (!grouped[svc.category]) {
        grouped[svc.category] = { name: svc.category, services: [] };
      }
      const sortedPrices = [...(svc.service_price_lines as { label: string; price: string; display_order: number }[])]
        .sort((a, b) => a.display_order - b.display_order);
      const service: Service = {
        name: svc.name,
        summary: svc.summary,
        duration: svc.duration ?? undefined,
        priceLines: sortedPrices.map((pl) => pl.price ? `${pl.label}: ${pl.price}` : pl.label),
      };
      grouped[svc.category].services.push(service);
    }
    serviceGroups = Object.values(grouped);
  }

  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-12 size-72 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-12 size-52 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Services and pricing
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Treatment options for refreshed skin, natural structure, and <em>wellness support.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Pricing is listed from the current public menu. Some treatments require consultation, and final recommendations are made by the provider.
            </p>
          </div>
        </div>
      </section>

      {/* Service category slideshow */}
      <div className="mx-auto max-w-7xl">
        <ServiceSlideshow />
      </div>

      {/* Service groups */}
      <ServicesPricingSection bookingUrl={bookingUrl} serviceGroups={serviceGroups} />
    </>
  );
}
