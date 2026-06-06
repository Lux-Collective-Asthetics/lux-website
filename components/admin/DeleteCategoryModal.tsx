"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ServiceCategory } from "@/lib/types/db";

interface Props {
  category: ServiceCategory;
  serviceCount: number;
  otherCategories: ServiceCategory[];
  onConfirm: (reassignToId?: string) => void;
  onCancel: () => void;
}

export function DeleteCategoryModal({
  category,
  serviceCount,
  otherCategories,
  onConfirm,
  onCancel,
}: Props) {
  const [reassignToId, setReassignToId] = useState<string>("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Delete &ldquo;{category.name}&rdquo;?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {serviceCount > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              This category has <strong>{serviceCount}</strong> service{serviceCount !== 1 ? "s" : ""}.
              Choose where to move them before deleting, or they&apos;ll go to the system &ldquo;Other&rdquo; category.
            </p>
            <div className="mb-6">
              <label
                htmlFor="reassign-select"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Move services to
              </label>
              <select
                id="reassign-select"
                value={reassignToId}
                onChange={(e) => setReassignToId(e.target.value)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
              >
                <option value="">Other (system fallback)</option>
                {otherCategories
                  .filter((c) => !c.is_system)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            This category has no services. It will be deleted immediately.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reassignToId || undefined)}
            className="rounded bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Delete category
          </button>
        </div>
      </div>
    </div>
  );
}
