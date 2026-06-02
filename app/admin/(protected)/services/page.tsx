import { createServiceClient } from "@/lib/supabase/service";
import { ServicesClient } from "./ServicesClient";
import {
  updateService,
  toggleServiceVisibility,
  upsertServicePriceLine,
  deleteServicePriceLine,
} from "./actions";
import type { DbServiceWithPrices } from "@/lib/types/db";

export default async function ServicesAdminPage() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("services")
    .select("*, service_price_lines(*)")
    .order("display_order");
  if (error) throw new Error(error.message);

  return (
    <ServicesClient
      services={(data ?? []) as DbServiceWithPrices[]}
      onUpdate={updateService}
      onToggleVisibility={toggleServiceVisibility}
      onUpsertPriceLine={upsertServicePriceLine}
      onDeletePriceLine={deleteServicePriceLine}
    />
  );
}
