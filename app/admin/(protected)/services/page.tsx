import { createClient } from "@/lib/supabase/server";
import { ServicesClient } from "./ServicesClient";
import {
  updateService,
  toggleServiceVisibility,
  upsertServicePriceLine,
  deleteServicePriceLine,
} from "./actions";
import type { DbServiceWithPrices } from "@/lib/types/db";

export default async function ServicesAdminPage() {
  const supabase = await createClient();
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
