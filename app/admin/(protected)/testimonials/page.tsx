import { createServiceClient } from "@/lib/supabase/service";
import { TestimonialsClient } from "./TestimonialsClient";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialVisibility,
} from "./actions";
import type { DbTestimonial } from "@/lib/types/db";

export default async function TestimonialsAdminPage() {
  const supabase = createServiceClient();
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
