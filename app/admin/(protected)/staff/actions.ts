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

  revalidatePath("/admin/staff");
  revalidatePath("/about");
}
