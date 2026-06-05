"use client";

import { ServicesPricingSection } from "@/components/services-pricing-section";
import type { ServiceGroup } from "@/content/site";
import { usePublicServiceGroups } from "@/lib/public-content-hooks";

export function PublicServicesPricing({
  initialServiceGroups,
}: {
  initialServiceGroups: ServiceGroup[];
}) {
  const { data: serviceGroups } = usePublicServiceGroups(initialServiceGroups);

  if (serviceGroups.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Services are being updated. Check back soon.</p>
      </div>
    );
  }

  return <ServicesPricingSection serviceGroups={serviceGroups} />;
}
