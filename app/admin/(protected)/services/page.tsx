import { createServiceClient } from "@/lib/supabase/service";
import { ServicesClient } from "./ServicesClient";
import {
  createService,
  deleteService,
  updateService,
  toggleServiceVisibility,
  upsertServicePriceLine,
  deleteServicePriceLine,
  createServiceCategory,
  deleteServiceCategory,
} from "./actions";
import type { DbServiceWithPrices, ServiceCategory } from "@/lib/types/db";

export default async function ServicesAdminPage() {
  const supabase = createServiceClient();

  const [servicesRes, categoriesRes] = await Promise.all([
    supabase.from("services").select("*, service_price_lines(*)").order("display_order"),
    supabase.from("service_categories").select("*").order("display_order"),
  ]);

  if (servicesRes.error) throw new Error(servicesRes.error.message);

  // Tolerate missing service_categories table if migration not yet run
  const categories = (!categoriesRes.error ? (categoriesRes.data ?? []) : []) as ServiceCategory[];

  return (
    <ServicesClient
      services={(servicesRes.data ?? []) as DbServiceWithPrices[]}
      categories={categories}
      onCreate={createService}
      onDelete={deleteService}
      onUpdate={updateService}
      onToggleVisibility={toggleServiceVisibility}
      onUpsertPriceLine={upsertServicePriceLine}
      onDeletePriceLine={deleteServicePriceLine}
      onCreateCategory={createServiceCategory}
      onDeleteCategory={deleteServiceCategory}
    />
  );
}
