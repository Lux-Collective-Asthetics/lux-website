"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";
import type { StaffPhoto } from "@/lib/types/db";

function storagePathFromUrl(url: string, bucket: string): string | null {
  const marker = `/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

function revalidateStaffPages() {
  revalidatePath("/admin/staff");
  revalidatePath("/about");
}

export async function createStaffMember(data: {
  name: string;
  credential: string;
  title: string;
  bio: string;
  photo_url: string;
  booking_url: string;
}): Promise<string> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("staff_members")
    .select("*", { count: "exact", head: true });
  const { data: inserted, error } = await supabase.from("staff_members").insert({
    name: data.name,
    credential: data.credential,
    title: data.title,
    bio: data.bio,
    photo_url: data.photo_url || null,
    booking_url: data.booking_url || null,
    display_order: count ?? 0,
    is_visible: true,
  }).select("id").single();
  if (error) throw new Error(error.message);
  revalidateStaffPages();
  return inserted.id;
}

export async function updateStaffMember(
  id: string,
  data: {
    name: string;
    credential: string;
    title: string;
    bio: string;
    photo_url: string;
    booking_url: string;
  }
) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("staff_members")
    .update({
      name: data.name,
      credential: data.credential,
      title: data.title,
      bio: data.bio,
      photo_url: data.photo_url || null,
      booking_url: data.booking_url || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStaffPages();
}

export async function deleteStaffMember(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const [{ data: member }, { data: photos }] = await Promise.all([
    supabase.from("staff_members").select("photo_url").eq("id", id).maybeSingle(),
    supabase.from("staff_photos").select("photo_url").eq("staff_id", id),
  ]);

  const { error } = await supabase.from("staff_members").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const urlsToDelete = [
    member?.photo_url,
    ...(photos ?? []).map((p) => p.photo_url),
  ].filter(Boolean) as string[];

  const paths = urlsToDelete
    .map((url) => storagePathFromUrl(url, "lux-staff"))
    .filter(Boolean) as string[];

  if (paths.length > 0) await supabase.storage.from("lux-staff").remove(paths);

  revalidateStaffPages();
}

export async function toggleStaffVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("staff_members")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStaffPages();
}

export async function addStaffPhoto(staffId: string, photoUrl: string): Promise<StaffPhoto> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("staff_photos")
    .select("*", { count: "exact", head: true })
    .eq("staff_id", staffId);
  const { data, error } = await supabase
    .from("staff_photos")
    .insert({ staff_id: staffId, photo_url: photoUrl, display_order: count ?? 0 })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/about");
  return data as StaffPhoto;
}

export async function deleteStaffPhoto(photoId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: row } = await supabase
    .from("staff_photos")
    .select("photo_url")
    .eq("id", photoId)
    .maybeSingle();

  const { error } = await supabase.from("staff_photos").delete().eq("id", photoId);
  if (error) throw new Error(error.message);

  if (row?.photo_url) {
    const path = storagePathFromUrl(row.photo_url, "lux-staff");
    if (path) await supabase.storage.from("lux-staff").remove([path]);
  }

  revalidatePath("/about");
}

export async function getStaffPhotos(staffId: string): Promise<StaffPhoto[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("staff_photos")
    .select("*")
    .eq("staff_id", staffId)
    .order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as StaffPhoto[];
}

export async function updateStaffServices(staffId: string, serviceIds: string[]) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: current, error: fetchError } = await supabase
    .from("staff_services")
    .select("service_id")
    .eq("staff_id", staffId);
  if (fetchError) throw new Error(fetchError.message);

  const currentIds = new Set(current?.map((r) => r.service_id) ?? []);
  const nextIds = new Set(serviceIds);

  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));
  const toAdd = [...nextIds].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("staff_services")
      .delete()
      .eq("staff_id", staffId)
      .in("service_id", toRemove);
    if (error) throw new Error(error.message);
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("staff_services")
      .insert(toAdd.map((service_id) => ({ staff_id: staffId, service_id })));
    if (error) throw new Error(error.message);
  }

  revalidateStaffPages();
}
