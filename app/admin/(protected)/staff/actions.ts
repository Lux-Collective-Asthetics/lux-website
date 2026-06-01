"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";

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
  revalidatePath("/admin/staff");
  revalidatePath("/about");
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
  revalidatePath("/admin/staff");
  revalidatePath("/about");
}

export async function deleteStaffMember(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("staff_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/staff");
  revalidatePath("/about");
}

export async function toggleStaffVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("staff_members")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/staff");
}

export async function updateStaffServices(staffId: string, serviceIds: string[]) {
  await requireAdmin();
  const supabase = createServiceClient();
  // Delete existing and re-insert
  const { error: deleteError } = await supabase.from("staff_services").delete().eq("staff_id", staffId);
  if (deleteError) throw new Error(deleteError.message);
  if (serviceIds.length > 0) {
    const { error } = await supabase.from("staff_services").insert(
      serviceIds.map((service_id) => ({ staff_id: staffId, service_id }))
    );
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/staff");
  revalidatePath("/about");
}
