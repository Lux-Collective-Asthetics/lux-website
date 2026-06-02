"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";
import type { ServicePriceLine } from "@/lib/types/db";

function revalidateServicePages() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function updateService(
  id: string,
  data: { name: string; summary: string; duration: string; hero_image_url: string }
) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: data.name,
      summary: data.summary,
      duration: data.duration || null,
      hero_image_url: data.hero_image_url || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
}

export async function toggleServiceVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("services")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
}

export async function upsertServicePriceLine(data: {
  id?: string;
  service_id: string;
  label: string;
  price: string;
  display_order: number;
}): Promise<ServicePriceLine> {
  await requireAdmin();
  const supabase = createServiceClient();

  if (data.id) {
    const { data: updatedLine, error } = await supabase
      .from("service_price_lines")
      .update({ label: data.label, price: data.price, display_order: data.display_order })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidateServicePages();
    return updatedLine as ServicePriceLine;
  }

  const { data: insertedLine, error } = await supabase
    .from("service_price_lines")
    .insert({
      service_id: data.service_id,
      label: data.label,
      price: data.price,
      display_order: data.display_order,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateServicePages();
  return insertedLine as ServicePriceLine;
}

export async function deleteServicePriceLine(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("service_price_lines").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
}
