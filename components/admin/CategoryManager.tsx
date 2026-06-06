"use client";

import { useState, useEffect } from "react";
import { ImageIcon, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/lib/types/db";

interface Props {
  categories: ServiceCategory[];
  saving: boolean;
  onAdd: (name: string) => Promise<void>;
  onRequestDelete: (cat: ServiceCategory) => void;
  onUpdateImage: (id: string, url: string) => Promise<void>;
}

export function CategoryManager({ categories, saving, onAdd, onRequestDelete, onUpdateImage }: Props) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (!editingImageId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingImageId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingImageId]);

  async function handleAdd() {
    const name = newCategoryName.trim();
    if (!name) return;
    await onAdd(name);
    setNewCategoryName("");
  }

  async function handleUpdateImage(id: string, url: string) {
    await onUpdateImage(id, url);
    setEditingImageId(null);
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Manage service categories</h2>

      {categories.length === 0 && (
        <p className="mb-3 text-xs text-muted-foreground">
          No categories yet. Run the migration in Supabase SQL Editor first:
          <code className="ml-1 rounded bg-muted px-1 py-0.5 text-xs">
            supabase/migrations/003_service_categories.sql
          </code>
        </p>
      )}

      <div className="mb-3 space-y-2">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
              {/* Thumbnail */}
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {cat.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image_url} alt={cat.name} className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground" />
                )}
              </div>

              <span className="flex-1 text-sm font-medium">{cat.name}</span>

              {cat.is_system && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  system
                </span>
              )}

              <button
                type="button"
                onClick={() => setEditingImageId((prev) => (prev === cat.id ? null : cat.id))}
                className={cn(
                  "rounded p-1.5 text-muted-foreground hover:bg-muted",
                  editingImageId === cat.id && "bg-muted text-foreground"
                )}
                title="Edit category image"
              >
                <ImageIcon className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => !cat.is_system && onRequestDelete(cat)}
                disabled={saving || cat.is_system}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                title={cat.is_system ? "System category — cannot be deleted" : `Delete "${cat.name}"`}
              >
                <X className="size-3.5" />
              </button>
            </div>

            {editingImageId === cat.id && (
              <div className="mt-1 rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Category image — shown in slideshow and homepage
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingImageId(null)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Close (Esc)"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <ImageUpload
                  bucket="lux-services"
                  onUpload={(url) => handleUpdateImage(cat.id, url)}
                  currentUrl={cat.image_url || undefined}
                  label={`${cat.name} category image`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new category */}
      <div className="flex gap-2">
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
          }}
          placeholder="New category name"
          className="flex-1 rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newCategoryName.trim() || saving}
          className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
