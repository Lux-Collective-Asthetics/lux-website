import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GalleryFilter } from "./GalleryFilter";
import type { GalleryImage, ServiceCategory } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Real before and after results from Lux Collective clients in Newark, Ohio.",
  openGraph: {
    title: "Gallery | The Lux Collective",
    description: "Real results from real clients at Lux Collective in Newark, Ohio.",
    url: "https://theluxcollectiveaesthetics.com/gallery",
  },
};

export default async function GalleryPage() {
  let images: GalleryImage[] = [];
  let serviceCategories: ServiceCategory[] = [];
  try {
    const supabase = await createClient();
    const [imagesRes, categoriesRes] = await Promise.all([
      supabase.from("gallery_images").select("*").eq("is_visible", true).order("display_order"),
      supabase.from("service_categories").select("*").order("display_order"),
    ]);

    if (imagesRes.error) {
      console.error("Failed to fetch gallery images:", imagesRes.error.message);
    } else {
      images = (imagesRes.data ?? []) as GalleryImage[];
    }

    if (!categoriesRes.error) {
      serviceCategories = (categoriesRes.data ?? []) as ServiceCategory[];
    }
  } catch (err) {
    console.error("Gallery fetch exception:", err);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
          Results
        </p>
        <h1 className="mt-3 text-4xl text-primary sm:text-5xl">Our Work</h1>
        <p className="mt-3 text-muted-foreground">
          Real results from real clients. Hover to explore.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          Gallery coming soon.
        </div>
      ) : (
        <>
          <GalleryFilter images={images} serviceCategories={serviceCategories} />
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Images are of real Lux Collective clients. Results may vary.
          </p>
        </>
      )}
    </div>
  );
}
