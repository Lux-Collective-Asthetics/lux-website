"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, EyeOff, Trash2, Pencil, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import type { DbTestimonial } from "@/lib/types/db";

type Props = {
  initialTestimonials: DbTestimonial[];
  onCreate: (data: { quote: string; author: string; photo_url: string }) => Promise<void>;
  onUpdate: (id: string, data: { quote: string; author: string; photo_url: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
};

type PanelState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; testimonial: DbTestimonial };

export function TestimonialsClient({
  initialTestimonials,
  onCreate,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialTestimonials);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  function openCreate() {
    setQuote(""); setAuthor(""); setPhotoUrl(""); setError(null);
    setPanel({ mode: "create" });
  }

  function openEdit(t: DbTestimonial) {
    setQuote(t.quote); setAuthor(t.author); setPhotoUrl(t.photo_url ?? ""); setError(null);
    setPanel({ mode: "edit", testimonial: t });
  }

  function closePanel() {
    setPanel({ mode: "closed" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quote || !author) return;
    setSubmitting(true);
    setError(null);
    try {
      if (panel.mode === "create") {
        await onCreate({ quote, author, photo_url: photoUrl });
        router.refresh();
      } else if (panel.mode === "edit") {
        await onUpdate(panel.testimonial.id, { quote, author, photo_url: photoUrl });
        setItems((prev) =>
          prev.map((t) =>
            t.id === panel.testimonial.id
              ? { ...t, quote, author, photo_url: photoUrl || null }
              : t
          )
        );
      }
      closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await onDelete(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleToggle(id: string, current: boolean) {
    await onToggleVisibility(id, !current);
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, is_visible: !current } : t)));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage client testimonials shown on the site.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
        >
          <Plus className="size-4" /> Add Testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No testimonials yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex gap-4 rounded-lg border border-border bg-card p-4"
            >
              {t.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.photo_url}
                  alt={t.author}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              )}
              {!t.photo_url && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {t.author[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground line-clamp-2">&quot;{t.quote}&quot;</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">— {t.author}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(t.id, t.is_visible)}
                  className={cn(
                    "rounded p-1.5 text-xs",
                    t.is_visible
                      ? "text-green-600 hover:bg-green-50"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label={t.is_visible ? "Hide testimonial" : "Show testimonial"}
                >
                  {t.is_visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Edit testimonial"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in panel */}
      {panel.mode !== "closed" && (
        <div className="fixed inset-0 z-50 flex justify-end" onMouseDown={closePanel}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-background shadow-2xl border-l border-border p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {panel.mode === "create" ? "Add Testimonial" : "Edit Testimonial"}
              </h2>
              <button type="button" onClick={closePanel} aria-label="Close panel">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Quote</label>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  rows={4}
                  required
                  placeholder="The staff is absolutely amazing..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  placeholder="Jane D."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Photo (optional)</label>
                <ImageUpload
                  bucket="lux-testimonials"
                  onUpload={setPhotoUrl}
                  currentUrl={photoUrl || undefined}
                  label="Client headshot"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={!quote || !author || submitting}
                className="w-full rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Testimonial"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
