"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types/db";

type Props = {
  initialImages: GalleryImage[];
  onReorder: (items: { id: string; display_order: number }[]) => Promise<void>;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function GalleryGrid({
  initialImages,
  onReorder,
  onToggleVisibility,
  onDelete,
}: Props) {
  const [images, setImages] = useState(initialImages);
  const [deleting, setDeleting] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    setImages(reordered);
    await onReorder(
      reordered.map((item, idx) => ({ id: item.id, display_order: idx }))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image pair? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await onDelete(id);
      setImages((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((i) => i.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <SortableCard
              key={image.id}
              image={image}
              onToggleVisibility={onToggleVisibility}
              onDelete={handleDelete}
              isDeleting={deleting === image.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({
  image,
  onToggleVisibility,
  onDelete,
  isDeleting,
}: {
  image: GalleryImage;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        isDragging && "opacity-50 shadow-xl"
      )}
    >
      {/* Before/After image pair */}
      <div className="relative flex h-40 bg-muted">
        {image.before_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.before_url}
            alt="Before"
            className="h-full w-1/2 object-cover"
          />
        )}
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        {image.after_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.after_url}
            alt="After"
            className="h-full w-1/2 object-cover"
          />
        )}
        <div className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          Before
        </div>
        <div className="absolute right-2 top-2 rounded bg-[#c9a96e]/80 px-1.5 py-0.5 text-[10px] text-white">
          After
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {image.title}
            </p>
            <p className="text-xs text-muted-foreground">{image.category}</p>
            {image.caption && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {image.caption}
              </p>
            )}
          </div>
          <button
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleVisibility(image.id, !image.is_visible)}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
              image.is_visible
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {image.is_visible ? (
              <>
                <Eye className="size-3" /> Visible
              </>
            ) : (
              <>
                <EyeOff className="size-3" /> Hidden
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            disabled={isDeleting}
            className="ml-auto rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
