"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Trash2, Pencil, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import type { StaffMember, DbService } from "@/lib/types/db";

type Props = {
  initialStaff: StaffMember[];
  initialServices: DbService[];
  staffServiceMap: Record<string, string[]>; // staffId -> serviceId[]
  onCreate: (data: {
    name: string;
    credential: string;
    title: string;
    bio: string;
    photo_url: string;
    booking_url: string;
  }) => Promise<string>;
  onUpdate: (
    id: string,
    data: {
      name: string;
      credential: string;
      title: string;
      bio: string;
      photo_url: string;
      booking_url: string;
    }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
  onUpdateServices: (staffId: string, serviceIds: string[]) => Promise<void>;
};

type PanelState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; member: StaffMember };

type FormValues = {
  name: string;
  credential: string;
  title: string;
  bio: string;
  photo_url: string;
  booking_url: string;
  service_ids: string[];
};

const EMPTY_FORM: FormValues = {
  name: "",
  credential: "",
  title: "",
  bio: "",
  photo_url: "",
  booking_url: "",
  service_ids: [],
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function StaffClient({
  initialStaff,
  initialServices,
  staffServiceMap,
  onCreate,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onUpdateServices,
}: Props) {
  const [staff, setStaff] = useState(initialStaff);
  const [svcMap, setSvcMap] = useState(staffServiceMap);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setError(null);
    setPanel({ mode: "create" });
  }

  function openEdit(member: StaffMember) {
    setForm({
      name: member.name,
      credential: member.credential,
      title: member.title,
      bio: member.bio,
      photo_url: member.photo_url ?? "",
      booking_url: member.booking_url ?? "",
      service_ids: svcMap[member.id] ?? [],
    });
    setError(null);
    setPanel({ mode: "edit", member });
  }

  function closePanel() {
    setPanel({ mode: "closed" });
  }

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter((s) => s !== id)
        : [...prev.service_ids, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.credential || !form.title) return;
    setSubmitting(true);
    setError(null);
    try {
      if (panel.mode === "create") {
        const createdId = await onCreate(form);
        if (form.service_ids.length > 0) {
          await onUpdateServices(createdId, form.service_ids);
        }
      } else if (panel.mode === "edit") {
        const id = panel.member.id;
        await onUpdate(id, form);
        await onUpdateServices(id, form.service_ids);
        setStaff((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  name: form.name,
                  credential: form.credential,
                  title: form.title,
                  bio: form.bio,
                  photo_url: form.photo_url || null,
                  booking_url: form.booking_url || null,
                }
              : m
          )
        );
        setSvcMap((prev) => ({ ...prev, [id]: form.service_ids }));
      }
      closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this staff member?")) return;
    await onDelete(id);
    setStaff((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleToggle(id: string, current: boolean) {
    await onToggleVisibility(id, !current);
    setStaff((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_visible: !current } : m))
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage staff profiles, photos, and booking links.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
        >
          <Plus className="size-4" /> Add Staff Member
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <div
            key={member.id}
            className={cn(
              "rounded-lg border border-border bg-card p-4",
              !member.is_visible && "opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                  {initials(member.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {member.name}, {member.credential}
                </p>
                <p className="text-xs text-muted-foreground">{member.title}</p>
                {member.booking_url && (
                  <p className="mt-1 truncate text-xs text-[#c9a96e]">
                    Booking link set
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
              {member.bio}
            </p>
            {(svcMap[member.id] ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {(svcMap[member.id] ?? []).slice(0, 3).map((svcId) => {
                  const svc = initialServices.find((s) => s.id === svcId);
                  return svc ? (
                    <span
                      key={svcId}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {svc.name}
                    </span>
                  ) : null;
                })}
                {(svcMap[member.id] ?? []).length > 3 && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    +{(svcMap[member.id] ?? []).length - 3} more
                  </span>
                )}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                aria-label={member.is_visible ? "Hide staff member" : "Show staff member"}
                onClick={() => handleToggle(member.id, member.is_visible)}
                className={cn(
                  "rounded p-1.5",
                  member.is_visible
                    ? "text-green-600 hover:bg-green-50"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {member.is_visible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label="Edit staff member"
                onClick={() => openEdit(member)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Delete staff member"
                onClick={() => handleDelete(member.id)}
                className="ml-auto rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create slide-in panel */}
      {panel.mode !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onMouseDown={closePanel}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-background shadow-2xl border-l border-border p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {panel.mode === "create" ? "Add Staff Member" : "Edit Staff Member"}
              </h2>
              <button type="button" aria-label="Close panel" onClick={closePanel}>
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    required
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Credential
                  </label>
                  <input
                    value={form.credential}
                    onChange={(e) => setField("credential", e.target.value)}
                    required
                    placeholder="CNP"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                  placeholder="Certified Nurse Practitioner"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Booking URL
                </label>
                <input
                  type="url"
                  value={form.booking_url}
                  onChange={(e) => setField("booking_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Photo</label>
                <ImageUpload
                  bucket="lux-staff"
                  onUpload={(url) => setField("photo_url", url)}
                  currentUrl={form.photo_url || undefined}
                  label="Staff headshot"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Services Offered
                </label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {initialServices.map((svc) => (
                    <label
                      key={svc.id}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={form.service_ids.includes(svc.id)}
                        onChange={() => toggleService(svc.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{svc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({svc.category})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={
                  !form.name || !form.credential || !form.title || submitting
                }
                className="w-full rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : panel.mode === "create"
                    ? "Add Staff Member"
                    : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
