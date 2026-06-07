import { createServiceClient } from "@/lib/supabase/service";
import { GalleryGrid } from "./GalleryGrid";
import { UploadGalleryModal } from "./UploadGalleryModal";
import {
  createGalleryImage,
  updateGalleryOrder,
  toggleGalleryVisibility,
  deleteGalleryImage,
} from "./actions";
import type { GalleryImage } from "@/lib/types/db";

export default async function GalleryAdminPage() {
  const supabase = createServiceClient();
  const [
    { data: images, error: imagesError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase.from("gallery_images").select("*").order("display_order"),
    supabase.from("service_categories").select("name").eq("is_system", false).order("display_order"),
  ]);

  if (imagesError) throw new Error(imagesError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  const categoryNames = (categories ?? []).map((c: { name: string }) => c.name);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage before/after image pairs. Drag to reorder.
          </p>
        </div>
        <UploadGalleryModal categories={categoryNames} onSubmit={createGalleryImage} />
      </div>

      {images && images.length > 0 ? (
        <GalleryGrid
          initialImages={images as GalleryImage[]}
          onReorder={updateGalleryOrder}
          onToggleVisibility={toggleGalleryVisibility}
          onDelete={deleteGalleryImage}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No gallery images yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &quot;Add Image Pair&quot; to upload your first before/after set.
          </p>
        </div>
      )}
    </div>
  );
}
