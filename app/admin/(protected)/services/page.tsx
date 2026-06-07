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
  updateServiceCategoryImage,
} from "./actions";
import type { DbServiceWithPrices, ServiceCategory } from "@/lib/types/db";

export default async function ServicesAdminPage() {
  const supabase = createServiceClient();

  const [servicesRes, categoriesRes] = await Promise.all([
    supabase.from("services").select("*, service_price_lines(*)").order("display_order"),
    supabase.from("service_categories").select("*").order("display_order"),
  ]);

  if (servicesRes.error) throw new Error(servicesRes.error.message);

  // Tolerate missing service_categories table if migration not yet run; rethrow other errors.
  if (categoriesRes.error) {
    const msg = categoriesRes.error.message;
    const isMissingTable =
      msg.includes("service_categories") ||
      msg.includes("42P01") ||
      msg.toLowerCase().includes("does not exist");
    if (!isMissingTable) throw new Error(msg);
  }
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
      onUpdateCategoryImage={updateServiceCategoryImage}
    />
  );
}
