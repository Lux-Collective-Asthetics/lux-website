import { createClient } from "@/lib/supabase/server";
import { TestimonialsClient } from "./TestimonialsClient";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialVisibility,
} from "./actions";
import type { DbTestimonial } from "@/lib/types/db";

export default async function TestimonialsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order");

  return (
    <TestimonialsClient
      initialTestimonials={(data ?? []) as DbTestimonial[]}
      onCreate={createTestimonial}
      onUpdate={updateTestimonial}
      onDelete={deleteTestimonial}
      onToggleVisibility={toggleTestimonialVisibility}
    />
  );
}
