"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

const CATEGORIES = [
  "Injectables",
  "Laser Treatments",
  "Regenerative Treatments",
  "Wellness",
];

type Props = {
  onSubmit: (data: {
    title: string;
    category: string;
    caption: string;
    before_url: string;
    after_url: string;
  }) => Promise<void>;
};

export function UploadGalleryModal({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [caption, setCaption] = useState("");
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title && beforeUrl && afterUrl && !submitting;

  function handleClose() {
    setOpen(false);
    setTitle("");
    setCategory(CATEGORIES[0]);
    setCaption("");
    setBeforeUrl("");
    setAfterUrl("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title,
        category,
        caption,
        before_url: beforeUrl,
        after_url: afterUrl,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
      >
        <Plus className="size-4" /> Add Image Pair
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={handleClose}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Image Pair</h2>
              <button type="button" onClick={handleClose} aria-label="Close dialog">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Botox — Forehead Lines"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>

              <div>
                <label htmlFor="gallery-category" className="mb-1 block text-sm font-medium">
                  Category
                </label>
                <select
                  id="gallery-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="2 weeks post-treatment"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Before Image
                </label>
                <ImageUpload
                  bucket="lux-gallery"
                  onUpload={setBeforeUrl}
                  currentUrl={beforeUrl || undefined}
                  label="Before photo"
                />
                {beforeUrl && (
                  <p className="mt-1 text-xs text-green-600">
                    Before image uploaded
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  After Image
                </label>
                <ImageUpload
                  bucket="lux-gallery"
                  onUpload={setAfterUrl}
                  currentUrl={afterUrl || undefined}
                  label="After photo"
                />
                {afterUrl && (
                  <p className="mt-1 text-xs text-green-600">
                    After image uploaded
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Image Pair"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
