"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Check, X, Plus, Trash2, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { DeleteCategoryModal } from "@/components/admin/DeleteCategoryModal";
import { cn } from "@/lib/utils";
import type { DbService, DbServiceWithPrices, ServiceCategory, ServicePriceLine } from "@/lib/types/db";
import { getServiceCountByCategory } from "./actions";

type Props = {
  services: DbServiceWithPrices[];
  categories: ServiceCategory[];
  onCreate: (data: {
    name: string; summary: string; category: string; category_id: string;
    duration: string; hero_image_url: string;
  }) => Promise<DbService>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    data: { name: string; summary: string; duration: string; hero_image_url: string }
  ) => Promise<void>;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
  onUpsertPriceLine: (data: {
    id?: string; service_id: string; label: string;
    price: string; display_order: number;
  }) => Promise<ServicePriceLine>;
  onDeletePriceLine: (id: string) => Promise<void>;
  onCreateCategory: (name: string) => Promise<ServiceCategory>;
  onDeleteCategory: (id: string, reassignToId?: string) => Promise<void>;
  onUpdateCategoryImage: (id: string, imageUrl: string | null) => Promise<void>;
};

type EditingService = {
  name: string; summary: string; duration: string; hero_image_url: string;
};

type NewServiceForm = {
  name: string; summary: string; category: string; category_id: string;
  duration: string; hero_image_url: string;
};

const emptyNewService: NewServiceForm = {
  name: "", summary: "", category: "", category_id: "", duration: "", hero_image_url: "",
};

export function ServicesClient({
  services,
  categories,
  onCreate,
  onDelete,
  onUpdate,
  onToggleVisibility,
  onUpsertPriceLine,
  onDeletePriceLine,
  onCreateCategory,
  onDeleteCategory,
  onUpdateCategoryImage,
}: Props) {
  const [localServices, setLocalServices] = useState(services);
  const [localCategories, setLocalCategories] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditingService | null>(null);
  const [saving, setSaving] = useState(false);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState<NewServiceForm>(emptyNewService);
  const [newFormSaving, setNewFormSaving] = useState(false);

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [activeAdminCategoryId, setActiveAdminCategoryId] = useState<string | null>(
    categories.find((c) => !c.is_system)?.id ?? categories[0]?.id ?? null
  );
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<ServiceCategory | null>(null);
  const [deleteCategoryCount, setDeleteCategoryCount] = useState(0);

  // ── Edit existing service ────────────────────────────────────────────────

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

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      await onDelete(id);
      setLocalServices((prev) => prev.filter((s) => s.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setSaving(false);
    }
  }

  // ── Price lines ──────────────────────────────────────────────────────────

  async function handleUpsertPriceLine(data: Parameters<Props["onUpsertPriceLine"]>[0]) {
    setSaving(true);
    try {
      const updatedLine = await onUpsertPriceLine(data);
      setLocalServices((prev) =>
        prev.map((service) => {
          if (service.id !== updatedLine.service_id) return service;
          const idx = service.service_price_lines.findIndex((l) => l.id === updatedLine.id);
          const lines = [...service.service_price_lines];
          if (idx >= 0) lines[idx] = updatedLine; else lines.push(updatedLine);
          return { ...service, service_price_lines: lines };
        })
      );
      return updatedLine;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePriceLine(serviceId: string, id: string) {
    setSaving(true);
    try {
      await onDeletePriceLine(id);
      setLocalServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? { ...s, service_price_lines: s.service_price_lines.filter((l) => l.id !== id) }
            : s
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Create new service ───────────────────────────────────────────────────

  async function handleCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.category_id) return;
    setNewFormSaving(true);
    try {
      const created = await onCreate(newForm);
      setLocalServices((prev) => [
        ...prev,
        { ...created, service_price_lines: [] } as DbServiceWithPrices,
      ]);
      setNewForm(emptyNewService);
      setShowNewForm(false);
    } finally {
      setNewFormSaving(false);
    }
  }

  // ── Category management ──────────────────────────────────────────────────

  async function handleCreateCategory(name: string) {
    setCategorySaving(true);
    try {
      const cat = await onCreateCategory(name);
      setLocalCategories((prev) => [...prev, cat]);
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleDeleteCategory(id: string, reassignToId?: string) {
    setCategorySaving(true);
    try {
      await onDeleteCategory(id, reassignToId);
      setLocalCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteCategoryTarget(null);
      if (activeAdminCategoryId === id) {
        const remaining = localCategories.filter((c) => c.id !== id);
        setActiveAdminCategoryId(remaining.find((c) => !c.is_system)?.id ?? remaining[0]?.id ?? null);
      }
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleRequestDeleteCategory(cat: ServiceCategory) {
    const count = await getServiceCountByCategory(cat.id);
    setDeleteCategoryCount(count);
    setDeleteCategoryTarget(cat);
  }

  async function handleUpdateCategoryImage(id: string, url: string) {
    await onUpdateCategoryImage(id, url);
    setLocalCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, image_url: url } : c))
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, and organize services and categories.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCategoryManager((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <Tag className="size-3.5" />
            Categories
            {showCategoryManager ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              const activeCat = localCategories.find((c) => c.id === activeAdminCategoryId);
              setShowNewForm((v) => !v);
              setNewForm(activeCat
                ? { ...emptyNewService, category: activeCat.name, category_id: activeCat.id }
                : emptyNewService
              );
            }}
            className="flex items-center gap-1.5 rounded-full bg-[#c9a96e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#b8954f]"
          >
            <Plus className="size-3.5" />
            New service
          </button>
        </div>
      </div>

      {/* Category tabs */}
      {localCategories.length > 0 && (
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-0">
          {localCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setActiveAdminCategoryId(cat.id); setShowCategoryManager(false); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeAdminCategoryId === cat.id
                  ? "border-[#c9a96e] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
              {cat.is_system && (
                <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  system
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Category manager */}
      {showCategoryManager && (
        <CategoryManager
          categories={localCategories}
          saving={categorySaving}
          onAdd={handleCreateCategory}
          onRequestDelete={handleRequestDeleteCategory}
          onUpdateImage={handleUpdateCategoryImage}
        />
      )}

      {/* New service form */}
      {showNewForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-lg border border-[#c9a96e]/40 bg-card p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-foreground">New service</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="new-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                Name *
              </label>
              <input
                id="new-name"
                required
                value={newForm.name}
                onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
            </div>
            <div>
              <label htmlFor="new-category" className="mb-1 block text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <select
                id="new-category"
                required
                value={newForm.category_id}
                onChange={(e) => {
                  const cat = localCategories.find((c) => c.id === e.target.value);
                  setNewForm((p) => ({ ...p, category_id: e.target.value, category: cat?.name ?? "" }));
                }}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              >
                <option value="">Select a category…</option>
                {localCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="new-summary" className="mb-1 block text-xs font-medium text-muted-foreground">
                Summary
              </label>
              <textarea
                id="new-summary"
                rows={2}
                value={newForm.summary}
                onChange={(e) => setNewForm((p) => ({ ...p, summary: e.target.value }))}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
            </div>
            <div>
              <label htmlFor="new-duration" className="mb-1 block text-xs font-medium text-muted-foreground">
                Duration
              </label>
              <input
                id="new-duration"
                placeholder="e.g. 30–45 min"
                value={newForm.duration}
                onChange={(e) => setNewForm((p) => ({ ...p, duration: e.target.value }))}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Hero image</p>
              <ImageUpload
                bucket="lux-services"
                onUpload={(url) => setNewForm((p) => ({ ...p, hero_image_url: url }))}
                currentUrl={newForm.hero_image_url || undefined}
                label="Service image"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newFormSaving || !newForm.name.trim() || !newForm.category_id}
              className="rounded bg-[#c9a96e] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#b8954f] disabled:opacity-50"
            >
              {newFormSaving ? "Creating…" : "Create service"}
            </button>
          </div>
        </form>
      )}

      {/* Service list — filtered to active category */}
      <div className="space-y-4">
        {(() => {
          const activeCat = localCategories.find((c) => c.id === activeAdminCategoryId);
          const filtered = localServices
            .filter((s) =>
              s.category_id
                ? s.category_id === activeAdminCategoryId
                : s.category === activeCat?.name
            )
            .sort((a, b) => a.display_order - b.display_order);
          return filtered.length === 0 && !showNewForm ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No services in this category.{" "}
              <button
                type="button"
                onClick={() => {
                  setNewForm(activeCat
                    ? { ...emptyNewService, category: activeCat.name, category_id: activeCat.id }
                    : emptyNewService
                  );
                  setShowNewForm(true);
                }}
                className="text-[#c9a96e] underline-offset-2 hover:underline"
              >
                Add the first service
              </button>
            </p>
          ) : (
            <>
              {filtered.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  svc={svc}
                  isEditing={editingId === svc.id}
                  editValues={editValues}
                  saving={saving}
                  confirmDelete={confirmDeleteId === svc.id}
                  onStartEdit={() => startEdit(svc)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={() => saveEdit(svc.id)}
                  onEditChange={(field, value) =>
                    setEditValues((prev) => (prev ? { ...prev, [field]: value } : prev))
                  }
                  onToggleVisibility={() => handleToggle(svc.id, svc.is_visible)}
                  onRequestDelete={() => setConfirmDeleteId(svc.id)}
                  onConfirmDelete={() => handleDelete(svc.id)}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onUpsertPriceLine={handleUpsertPriceLine}
                  onDeletePriceLine={(id) => handleDeletePriceLine(svc.id, id)}
                />
              ))}
            </>
          );
        })()}
      </div>

      {deleteCategoryTarget && (
        <DeleteCategoryModal
          category={deleteCategoryTarget}
          serviceCount={deleteCategoryCount}
          otherCategories={localCategories.filter((c) => c.id !== deleteCategoryTarget.id)}
          onConfirm={(reassignToId) => handleDeleteCategory(deleteCategoryTarget.id, reassignToId)}
          onCancel={() => setDeleteCategoryTarget(null)}
        />
      )}
    </div>
  );
}

// ── ServiceCard ──────────────────────────────────────────────────────────────

function ServiceCard({
  svc,
  isEditing,
  editValues,
  saving,
  confirmDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
  onToggleVisibility,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onUpsertPriceLine,
  onDeletePriceLine,
}: {
  svc: DbServiceWithPrices;
  isEditing: boolean;
  editValues: EditingService | null;
  saving: boolean;
  confirmDelete: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (field: keyof EditingService, value: string) => void;
  onToggleVisibility: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onUpsertPriceLine: (data: {
    id?: string; service_id: string; label: string;
    price: string; display_order: number;
  }) => Promise<ServicePriceLine>;
  onDeletePriceLine: (id: string) => void;
}) {
  const [addingPrice, setAddingPrice] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceLabel, setEditingPriceLabel] = useState("");
  const [editingPriceValue, setEditingPriceValue] = useState("");

  async function handleAddPrice() {
    if (!newLabel) return;
    const nextOrder =
      svc.service_price_lines.length === 0
        ? 0
        : Math.max(...svc.service_price_lines.map((p) => p.display_order)) + 1;
    await onUpsertPriceLine({ service_id: svc.id, label: newLabel, price: newPrice, display_order: nextOrder });
    setNewLabel("");
    setNewPrice("");
    setAddingPrice(false);
  }

  async function saveEditingPriceLine(line: ServicePriceLine) {
    await onUpsertPriceLine({
      id: line.id,
      service_id: svc.id,
      label: editingPriceLabel,
      price: editingPriceValue,
      display_order: line.display_order,
    });
    setEditingPriceId(null);
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", !svc.is_visible && "opacity-60")}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {isEditing && editValues ? (
            <div className="space-y-3">
              <input
                aria-label="Service name"
                value={editValues.name}
                onChange={(e) => onEditChange("name", e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              />
              <textarea
                aria-label="Service summary"
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
                <p className="mb-1 text-xs font-medium text-muted-foreground">Hero image</p>
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
              {svc.duration && <p className="text-xs text-muted-foreground">{svc.duration}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{svc.summary}</p>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isEditing ? (
            <>
              <button type="button" onClick={onSaveEdit} disabled={saving}
                className="rounded p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50" title="Save">
                <Check className="size-4" />
              </button>
              <button type="button" onClick={onCancelEdit}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted" title="Cancel">
                <X className="size-4" />
              </button>
            </>
          ) : confirmDelete ? (
            <div className="flex items-center gap-1 rounded border border-destructive/30 bg-destructive/5 px-2 py-1">
              <span className="text-xs text-destructive">Delete?</span>
              <button type="button" onClick={onConfirmDelete} disabled={saving}
                className="rounded p-0.5 text-destructive hover:bg-destructive/10 disabled:opacity-50" title="Confirm delete">
                <Check className="size-3.5" />
              </button>
              <button type="button" onClick={onCancelDelete}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted" title="Cancel">
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={onToggleVisibility}
                className={cn("rounded p-1.5", svc.is_visible ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted")}
                title={svc.is_visible ? "Hide" : "Show"}>
                {svc.is_visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              <button type="button" onClick={onStartEdit}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted" title="Edit">
                <Pencil className="size-4" />
              </button>
              <button type="button" onClick={onRequestDelete}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete service">
                <Trash2 className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Price lines */}
      <div className="mt-3 space-y-1">
        {svc.service_price_lines
          .sort((a, b) => a.display_order - b.display_order)
          .map((pl) => (
            <div key={pl.id} className="flex flex-wrap items-center gap-2 rounded bg-muted/50 px-2 py-1">
              {editingPriceId === pl.id ? (
                <>
                  <input value={editingPriceLabel} onChange={(e) => setEditingPriceLabel(e.target.value)}
                    placeholder="Label"
                    className="min-w-[160px] rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none" />
                  <input value={editingPriceValue} onChange={(e) => setEditingPriceValue(e.target.value)}
                    placeholder="Price"
                    className="w-24 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none" />
                  <button type="button" onClick={() => saveEditingPriceLine(pl)} className="text-green-600" title="Save">
                    <Check className="size-3" />
                  </button>
                  <button type="button" onClick={() => setEditingPriceId(null)} className="text-muted-foreground" title="Cancel">
                    <X className="size-3" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-muted-foreground">{pl.label}</span>
                  {pl.price && <span className="text-xs font-medium">{pl.price}</span>}
                  <button type="button" onClick={() => { setEditingPriceId(pl.id); setEditingPriceLabel(pl.label); setEditingPriceValue(pl.price); }}
                    className="text-muted-foreground hover:text-foreground" title="Edit price line">
                    <Pencil className="size-3" />
                  </button>
                  <button type="button" onClick={() => onDeletePriceLine(pl.id)}
                    className="text-muted-foreground hover:text-destructive" title="Delete price line">
                    <X className="size-3" />
                  </button>
                </>
              )}
            </div>
          ))}

        {addingPrice ? (
          <div className="flex gap-2">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label"
              className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none" />
            <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Price"
              className="w-20 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none" />
            <button type="button" onClick={handleAddPrice} title="Save price line" className="text-green-600"><Check className="size-3" /></button>
            <button type="button" onClick={() => setAddingPrice(false)} title="Cancel" className="text-muted-foreground"><X className="size-3" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setAddingPrice(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Plus className="size-3" /> Add price line
          </button>
        )}
      </div>
    </div>
  );
}
