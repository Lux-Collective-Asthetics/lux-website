"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Pencil, X, Check } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import type { AboutGalleryPhoto } from "@/lib/types/db";

type Props = {
  initialPhotos: AboutGalleryPhoto[];
  onAdd: (photoUrl: string, caption: string) => Promise<AboutGalleryPhoto>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, isVisible: boolean) => Promise<void>;
  onUpdateCaption: (id: string, caption: string) => Promise<void>;
};

export function AboutGalleryClient({
  initialPhotos,
  onAdd,
  onDelete,
  onToggle,
  onUpdateCaption,
}: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingCaption, setPendingCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!pendingUrl) return;
    setSaving(true);
    setError(null);
    try {
      const photo = await onAdd(pendingUrl, pendingCaption);
      setPhotos((prev) => [...prev, photo]);
      setPendingUrl("");
      setPendingCaption("");
      setShowUpload(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add photo");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this photo from the About page gallery?")) return;
    try {
      await onDelete(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  }

  async function handleToggle(id: string, current: boolean) {
    await onToggle(id, !current);
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_visible: !current } : p))
    );
  }

  async function handleSaveCaption(id: string) {
    await onUpdateCaption(id, editCaption);
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption: editCaption || null } : p))
    );
    setEditingId(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">About Page Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Company and team photos shown at the top of the About page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
        >
          <Plus className="size-4" /> Add Photo
        </button>
      </div>

      {showUpload && (
        <div className="mb-6 rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Upload New Photo</h2>
            <button type="button" onClick={() => { setShowUpload(false); setPendingUrl(""); setPendingCaption(""); }}>
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>
          <ImageUpload
            bucket="lux-staff"
            onUpload={(url) => setPendingUrl(url)}
            currentUrl={pendingUrl || undefined}
            label="About page photo"
          />
          {pendingUrl && (
            <div className="mt-3 space-y-3">
              <input
                value={pendingCaption}
                onChange={(e) => setPendingCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="w-full rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add to Gallery"}
              </button>
            </div>
          )}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No photos yet. Add your first photo above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-border bg-card",
                !photo.is_visible && "opacity-60"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.photo_url}
                alt={photo.caption ?? "Gallery photo"}
                className="aspect-4/3 w-full object-cover"
              />
              <div className="p-3">
                {editingId === photo.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption"
                      className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                      autoFocus
                    />
                    <button type="button" onClick={() => handleSaveCaption(photo.id)}>
                      <Check className="size-4 text-green-600" />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      <X className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {photo.caption ?? <span className="italic">No caption</span>}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label="Edit caption"
                        onClick={() => { setEditingId(photo.id); setEditCaption(photo.caption ?? ""); }}
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={photo.is_visible ? "Hide photo" : "Show photo"}
                        onClick={() => handleToggle(photo.id, photo.is_visible)}
                        className={cn(
                          "rounded p-1",
                          photo.is_visible ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {photo.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Delete photo"
                        onClick={() => handleDelete(photo.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
