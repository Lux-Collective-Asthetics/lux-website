import { AboutGalleryClient } from "./AboutGalleryClient";
import {
  getAboutGalleryPhotos,
  addAboutGalleryPhoto,
  deleteAboutGalleryPhoto,
  toggleAboutGalleryVisibility,
  updateAboutGalleryPhoto,
} from "./actions";

export default async function AboutGalleryPage() {
  let photos = [];
  try {
    photos = await getAboutGalleryPhotos();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isMissingTable =
      msg.includes("about_gallery") ||
      msg.includes("42P01") ||
      msg.toLowerCase().includes("does not exist");
    if (!isMissingTable) throw err;
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <h1 className="text-lg font-semibold text-destructive">Migration required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The <code className="rounded bg-muted px-1 py-0.5 text-xs">about_gallery</code> table
          does not exist yet. Run the migration in{" "}
          <strong>Supabase Dashboard → SQL Editor</strong>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
          {`-- paste and run: supabase/migrations/002_staff_photos_about_gallery.sql`}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">Refresh this page after running the migration.</p>
      </div>
    );
  }

  return (
    <AboutGalleryClient
      initialPhotos={photos}
      onAdd={addAboutGalleryPhoto}
      onDelete={deleteAboutGalleryPhoto}
      onToggle={toggleAboutGalleryVisibility}
      onUpdateCaption={updateAboutGalleryPhoto}
    />
  );
}
