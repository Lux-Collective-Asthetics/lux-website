"use client";

import { TestimonialsMarquee } from "@/components/ui/testimonial-marquee";
import type { Testimonial } from "@/content/site";
import { usePublicTestimonials } from "@/lib/public-content-hooks";

export function HomepageTestimonials({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const { data: testimonials } = usePublicTestimonials(initialTestimonials);

  return <TestimonialsMarquee testimonials={testimonials} />;
}
