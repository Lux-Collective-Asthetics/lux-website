"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";
import type { AboutGalleryPhoto } from "@/lib/types/db";

function revalidate() {
  revalidatePath("/admin/about-gallery");
  revalidatePath("/about");
}

export async function getAboutGalleryPhotos(): Promise<AboutGalleryPhoto[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("about_gallery")
    .select("*")
    .order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as AboutGalleryPhoto[];
}

export async function addAboutGalleryPhoto(
  photoUrl: string,
  caption: string
): Promise<AboutGalleryPhoto> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("about_gallery")
    .select("*", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("about_gallery")
    .insert({ photo_url: photoUrl, caption: caption || null, display_order: count ?? 0, is_visible: true })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidate();
  return data as AboutGalleryPhoto;
}

export async function updateAboutGalleryPhoto(id: string, caption: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("about_gallery")
    .update({ caption: caption || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function deleteAboutGalleryPhoto(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("about_gallery").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function toggleAboutGalleryVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("about_gallery")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}
