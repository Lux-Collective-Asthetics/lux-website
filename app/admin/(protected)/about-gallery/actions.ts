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
  const { count, error: countError } = await supabase
    .from("about_gallery")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(countError.message);
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

function storagePathFromUrl(url: string, bucket: string): string | null {
  const marker = `/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function deleteAboutGalleryPhoto(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: row } = await supabase
    .from("about_gallery")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("about_gallery").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (row?.photo_url) {
    const path = storagePathFromUrl(row.photo_url, "lux-staff");
    if (path) await supabase.storage.from("lux-staff").remove([path]);
  }

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
