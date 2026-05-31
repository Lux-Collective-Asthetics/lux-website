"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";

export async function createGalleryImage(data: {
  title: string;
  category: string;
  caption: string;
  before_url: string;
  after_url: string;
}) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("gallery_images")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("gallery_images").insert({
    ...data,
    display_order: count ?? 0,
    is_visible: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
}

export async function updateGalleryOrder(
  items: { id: string; display_order: number }[]
) {
  await requireAdmin();
  const supabase = createServiceClient();
  await Promise.all(
    items.map(({ id, display_order }) =>
      supabase.from("gallery_images").update({ display_order }).eq("id", id)
    )
  );
  revalidatePath("/admin/gallery");
}

export async function toggleGalleryVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("gallery_images")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("gallery_images")
    .select("before_url, after_url")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Delete from storage (best-effort, don't fail if storage delete fails)
  if (data) {
    const extractPath = (url: string) =>
      url.split("/object/public/lux-gallery/")[1];
    const beforePath = extractPath(data.before_url);
    const afterPath = extractPath(data.after_url);
    if (beforePath)
      await supabase.storage.from("lux-gallery").remove([beforePath]);
    if (afterPath)
      await supabase.storage.from("lux-gallery").remove([afterPath]);
  }

  revalidatePath("/admin/gallery");
}
