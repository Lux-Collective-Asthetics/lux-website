import type { Service, ServiceGroup, Testimonial } from "@/content/site";
import type { AboutGalleryPhoto, GalleryImage, StaffMember } from "@/lib/types/db";
import { createClient } from "@/lib/supabase/client";

type DbServicePriceLine = {
  label: string;
  price: string;
  display_order: number;
};

type DbService = {
  name: string;
  summary: string;
  category: string;
  duration: string | null;
  display_order: number;
  service_price_lines: DbServicePriceLine[];
};

type DbTestimonial = {
  quote: string;
  author: string;
};

export const publicContentQueryKeys = {
  testimonials: ["public-content", "testimonials"] as const,
  services: ["public-content", "services"] as const,
  staff: ["public-content", "staff"] as const,
  gallery: ["public-content", "gallery"] as const,
  aboutGallery: ["public-content", "about-gallery"] as const,
};

export function mapDbServicesToServiceGroups(dbServices: DbService[]) {
  const grouped: Record<string, ServiceGroup> = {};

  for (const svc of dbServices) {
    if (!grouped[svc.category]) {
      grouped[svc.category] = { name: svc.category, services: [] };
    }

    const sortedPrices = [...svc.service_price_lines].sort(
      (a, b) => a.display_order - b.display_order
    );

    const service: Service = {
      name: svc.name,
      summary: svc.summary,
      duration: svc.duration ?? undefined,
      priceLines: sortedPrices.map((pl) => (pl.price ? `${pl.label}: ${pl.price}` : pl.label)),
    };

    grouped[svc.category].services.push(service);
  }

  return Object.values(grouped);
}

export async function fetchVisibleTestimonials() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("quote, author")
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);

  return ((data ?? []) as DbTestimonial[]).map((testimonial) => ({
    quote: testimonial.quote,
    author: testimonial.author,
  })) satisfies Testimonial[];
}

export async function fetchVisibleServiceGroups() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("name, summary, category, duration, display_order, service_price_lines(label, price, display_order)")
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);

  return mapDbServicesToServiceGroups((data ?? []) as DbService[]);
}

export async function fetchVisibleStaff() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff_members")
    .select("*")
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);

  return (data ?? []) as StaffMember[];
}

export async function fetchVisibleGalleryImages() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);

  return (data ?? []) as GalleryImage[];
}

export async function fetchVisibleAboutGallery() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("about_gallery")
    .select("*")
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);

  return (data ?? []) as AboutGalleryPhoto[];
}
