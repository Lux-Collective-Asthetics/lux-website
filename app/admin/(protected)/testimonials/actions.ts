"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";

export async function createTestimonial(data: {
  quote: string;
  author: string;
  photo_url: string;
}) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("testimonials")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("testimonials").insert({
    ...data,
    photo_url: data.photo_url || null,
    display_order: count ?? 0,
    is_visible: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}

export async function updateTestimonial(
  id: string,
  data: { quote: string; author: string; photo_url: string }
) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ quote: data.quote, author: data.author, photo_url: data.photo_url || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}

export async function toggleTestimonialVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}

export async function updateTestimonialOrder(
  items: { id: string; display_order: number }[]
) {
  await requireAdmin();
  const supabase = createServiceClient();
  await Promise.all(
    items.map(({ id, display_order }) =>
      supabase.from("testimonials").update({ display_order }).eq("id", id)
    )
  );
  revalidatePath("/admin/testimonials");
}
