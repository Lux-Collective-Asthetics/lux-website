"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";
import type { DbService, ServiceCategory, ServicePriceLine } from "@/lib/types/db";

function revalidateServicePages() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function createService(data: {
  name: string;
  summary: string;
  category: string;
  category_id: string;
  duration: string;
  hero_image_url: string;
}): Promise<DbService> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: maxRow } = await supabase
    .from("services")
    .select("display_order")
    .eq("category_id", data.category_id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? maxRow.display_order + 1 : 0;

  const { data: inserted, error } = await supabase
    .from("services")
    .insert({
      name: data.name,
      summary: data.summary,
      category: data.category,
      category_id: data.category_id,
      duration: data.duration || null,
      hero_image_url: data.hero_image_url || null,
      display_order: nextOrder,
      is_visible: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateServicePages();
  return inserted as DbService;
}

export async function deleteService(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
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

// ── Category management ──────────────────────────────────────────────────────

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceCategory[];
}

export async function updateServiceCategoryImage(id: string, imageUrl: string | null) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("service_categories")
    .update({ image_url: imageUrl })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
}

export async function createServiceCategory(name: string): Promise<ServiceCategory> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: maxRow } = await supabase
    .from("service_categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? maxRow.display_order + 1 : 0;

  const { data: inserted, error } = await supabase
    .from("service_categories")
    .insert({ name: name.trim(), display_order: nextOrder })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateServicePages();
  return inserted as ServiceCategory;
}

export async function deleteServiceCategory(id: string, reassignToId?: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: toDelete } = await supabase
    .from("service_categories")
    .select("is_system")
    .eq("id", id)
    .maybeSingle();
  if (toDelete?.is_system) throw new Error("Cannot delete a system category.");
  if (reassignToId === id) throw new Error("Cannot reassign a category to itself.");

  let targetId = reassignToId;
  let targetName: string | undefined;

  if (targetId) {
    const { data: targetCat } = await supabase
      .from("service_categories")
      .select("name")
      .eq("id", targetId)
      .maybeSingle();
    targetName = targetCat?.name;
  } else {
    const { data: otherCategory } = await supabase
      .from("service_categories")
      .select("id, name")
      .eq("is_system", true)
      .maybeSingle();
    targetId = otherCategory?.id;
    targetName = otherCategory?.name;
  }

  if (!targetId || !targetName) {
    throw new Error(
      "Cannot delete category: no reassignment target and no system 'Other' category found."
    );
  }

  const { error: reassignError } = await supabase
    .from("services")
    .update({ category_id: targetId, category: targetName })
    .eq("category_id", id);
  if (reassignError) throw new Error(reassignError.message);

  const { error } = await supabase.from("service_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateServicePages();
}

export async function getServiceCountByCategory(categoryId: string): Promise<number> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
