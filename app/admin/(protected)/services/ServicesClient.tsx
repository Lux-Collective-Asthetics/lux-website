"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Check, X, Plus } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import type { DbServiceWithPrices, ServicePriceLine } from "@/lib/types/db";

type Props = {
  services: DbServiceWithPrices[];
  onUpdate: (
    id: string,
    data: { name: string; summary: string; duration: string; hero_image_url: string }
  ) => Promise<void>;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
  onUpsertPriceLine: (data: {
    id?: string;
    service_id: string;
    label: string;
    price: string;
    display_order: number;
  }) => Promise<void>;
  onDeletePriceLine: (id: string) => Promise<void>;
};

type EditingService = {
  name: string;
  summary: string;
  duration: string;
  hero_image_url: string;
};

export function ServicesClient({
  services,
  onUpdate,
  onToggleVisibility,
  onUpsertPriceLine,
  onDeletePriceLine,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditingService | null>(null);
  const [saving, setSaving] = useState(false);
  const [localServices, setLocalServices] = useState(services);

  // Group by category
  const categories = [...new Set(localServices.map((s) => s.category))];

  function startEdit(svc: DbServiceWithPrices) {
    setEditingId(svc.id);
    setEditValues({
      name: svc.name,
      summary: svc.summary,
      duration: svc.duration ?? "",
      hero_image_url: svc.hero_image_url ?? "",
    });
  }

  async function saveEdit(id: string) {
    if (!editValues) return;
    setSaving(true);
    try {
      await onUpdate(id, editValues);
      setLocalServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: editValues.name,
                summary: editValues.summary,
                duration: editValues.duration || null,
                hero_image_url: editValues.hero_image_url || null,
              }
            : s
        )
      );
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    await onToggleVisibility(id, !current);
    setLocalServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_visible: !current } : s))
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit service details and pricing. Click the pencil icon to edit.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {cat}
            </h2>
            <div className="space-y-4">
              {localServices
                .filter((s) => s.category === cat)
                .sort((a, b) => a.display_order - b.display_order)
                .map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    svc={svc}
                    isEditing={editingId === svc.id}
                    editValues={editValues}
                    saving={saving}
                    onStartEdit={() => startEdit(svc)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={() => saveEdit(svc.id)}
                    onEditChange={(field, value) =>
                      setEditValues((prev) =>
                        prev ? { ...prev, [field]: value } : prev
                      )
                    }
                    onToggleVisibility={() => handleToggle(svc.id, svc.is_visible)}
                    onUpsertPriceLine={onUpsertPriceLine}
                    onDeletePriceLine={onDeletePriceLine}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ServiceCard({
  svc,
  isEditing,
  editValues,
  saving,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
  onToggleVisibility,
  onUpsertPriceLine,
  onDeletePriceLine,
}: {
  svc: DbServiceWithPrices;
  isEditing: boolean;
  editValues: EditingService | null;
  saving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (field: keyof EditingService, value: string) => void;
  onToggleVisibility: () => void;
  onUpsertPriceLine: Props["onUpsertPriceLine"];
  onDeletePriceLine: Props["onDeletePriceLine"];
}) {
  const [addingPrice, setAddingPrice] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");

  async function handleAddPrice() {
    if (!newLabel) return;
    await onUpsertPriceLine({
      service_id: svc.id,
      label: newLabel,
      price: newPrice,
      display_order: svc.service_price_lines.length,
    });
    setNewLabel("");
    setNewPrice("");
    setAddingPrice(false);
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        !svc.is_visible && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {isEditing && editValues ? (
            <div className="space-y-3">
              <input
                value={editValues.name}
                onChange={(e) => onEditChange("name", e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
              <textarea
                value={editValues.summary}
                onChange={(e) => onEditChange("summary", e.target.value)}
                rows={2}
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
              <input
                value={editValues.duration}
                onChange={(e) => onEditChange("duration", e.target.value)}
                placeholder="Duration (e.g. 30–45 min)"
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Hero image
                </p>
                <ImageUpload
                  bucket="lux-services"
                  onUpload={(url) => onEditChange("hero_image_url", url)}
                  currentUrl={editValues.hero_image_url || undefined}
                  label="Service image"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="font-semibold text-foreground">{svc.name}</p>
              {svc.duration && (
                <p className="text-xs text-muted-foreground">{svc.duration}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{svc.summary}</p>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={saving}
                className="rounded p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50"
                title="Save"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                title="Cancel"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleVisibility}
                className={cn(
                  "rounded p-1.5",
                  svc.is_visible
                    ? "text-green-600 hover:bg-green-50"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={svc.is_visible ? "Hide" : "Show"}
              >
                {svc.is_visible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onStartEdit}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                title="Edit"
              >
                <Pencil className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Price lines */}
      <div className="mt-3 space-y-1">
        {svc.service_price_lines
          .sort((a: ServicePriceLine, b: ServicePriceLine) => a.display_order - b.display_order)
          .map((pl: ServicePriceLine) => (
            <div
              key={pl.id}
              className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1"
            >
              <span className="flex-1 text-xs text-muted-foreground">{pl.label}</span>
              {pl.price && (
                <span className="text-xs font-medium">{pl.price}</span>
              )}
              <button
                type="button"
                onClick={() => onDeletePriceLine(pl.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

        {addingPrice ? (
          <div className="flex gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label"
              className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none"
            />
            <input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Price"
              className="w-20 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddPrice}
              className="text-green-600"
            >
              <Check className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => setAddingPrice(false)}
              className="text-muted-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingPrice(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" /> Add price line
          </button>
        )}
      </div>
    </div>
  );
}
