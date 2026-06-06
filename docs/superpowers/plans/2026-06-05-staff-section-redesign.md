# Staff Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public staff section on the About page to use a portrait card grid with cinematic gradient overlays, service pills, a featured owner card, and an enhanced detail modal with bio + services + booking CTA.

**Architecture:** Update the Supabase staff query to join services, propagate the richer `StaffMemberWithServices` type through the data layer (cache → hook → page → components), then rewrite `PublicStaffSection` for the new card grid and `StaffModal` for the side-by-side enhanced layout. No new files — all changes are in-place edits to 5 existing files.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, Supabase (server + browser client), `next/image`

---

### Task 1: Update `fetchVisibleStaff` to join services

**Files:**
- Modify: `lib/public-content-cache.ts`

- [ ] **Step 1: Add `StaffMemberWithServices` to the import in `lib/public-content-cache.ts`**

The type already exists in `lib/types/db.ts`:
```ts
export type StaffMemberWithServices = StaffMember & {
  staff_services: { service_id: string; services: { id: string; name: string } }[];
};
```
The Supabase join `select("*, staff_services(service_id, services(id, name))")` returns exactly this shape — no type file changes needed.

Replace line 2 of `lib/public-content-cache.ts`:
```ts
import type { AboutGalleryPhoto, GalleryImage, ServiceCategory, StaffMember, StaffMemberWithServices } from "@/lib/types/db";
```

- [ ] **Step 2: Replace `fetchVisibleStaff` in `lib/public-content-cache.ts`**

Replace lines 89–100 (the entire `fetchVisibleStaff` function):
```ts
export async function fetchVisibleStaff() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff_members")
    .select("*, staff_services(service_id, services(id, name))")
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw new Error(error.message);

  return (data ?? []) as StaffMemberWithServices[];
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd lux-collective && npx tsc --noEmit
```

Expected: errors will surface in `lib/public-content-hooks.ts` and `app/(public)/about/page.tsx` (type mismatch on `StaffMember[]` vs `StaffMemberWithServices[]`). That's correct — Tasks 2 and 3 fix them.

- [ ] **Step 4: Commit**

```bash
git add lib/public-content-cache.ts
git commit -m "feat: fetch staff services via supabase join in public cache"
```

---

### Task 2: Update `usePublicStaff` hook type signature

**Files:**
- Modify: `lib/public-content-hooks.ts`

- [ ] **Step 1: Update import in `lib/public-content-hooks.ts`**

Replace line 6:
```ts
import type { AboutGalleryPhoto, GalleryImage, ServiceCategory, StaffMember, StaffMemberWithServices } from "@/lib/types/db";
```

- [ ] **Step 2: Replace `usePublicStaff` in `lib/public-content-hooks.ts`**

Replace the `usePublicStaff` function (lines 42–50):
```ts
export function usePublicStaff(initialStaff: StaffMemberWithServices[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.staff,
    queryFn: fetchVisibleStaff,
    initialData: initialStaff,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: `lib/public-content-hooks.ts` errors clear. Remaining errors are in `app/(public)/about/page.tsx` — fixed in Task 3.

- [ ] **Step 4: Commit**

```bash
git add lib/public-content-hooks.ts
git commit -m "feat: update usePublicStaff to StaffMemberWithServices type"
```

---

### Task 3: Update `about/page.tsx` server query and static fallback

**Files:**
- Modify: `app/(public)/about/page.tsx`

- [ ] **Step 1: Update the `StaffMember` import to `StaffMemberWithServices`**

On line 8, change:
```ts
import type { AboutGalleryPhoto, StaffMember } from "@/lib/types/db";
```
to:
```ts
import type { AboutGalleryPhoto, StaffMemberWithServices } from "@/lib/types/db";
```

- [ ] **Step 2: Update the staff variable type (line 26)**

```ts
let staff: StaffMemberWithServices[] = [];
```

- [ ] **Step 3: Update the Supabase query inside `Promise.all` to join services**

Replace the `staffRes` query:
```ts
supabase
  .from("staff_members")
  .select("*, staff_services(service_id, services(id, name))")
  .eq("is_visible", true)
  .order("display_order"),
```

Update the cast below it:
```ts
if (!staffRes.error) {
  staff = (staffRes.data ?? []) as StaffMemberWithServices[];
}
```

- [ ] **Step 4: Add `staff_services: []` to the static fallback**

Replace the `if (staff.length === 0)` block (lines 45–59):
```ts
if (staff.length === 0) {
  staff = defaultStaff.map((member, index) => ({
    id: `static-${index}`,
    name: member.name,
    credential: member.credential,
    title: member.title,
    bio: member.bio,
    photo_url: member.photo ?? null,
    booking_url: null,
    display_order: index,
    is_visible: true,
    is_owner: member.isOwner ?? false,
    created_at: new Date().toISOString(),
    staff_services: [],
  }));
}
```

- [ ] **Step 5: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/about/page.tsx"
git commit -m "feat: join staff services in about page server query and static fallback"
```

---

### Task 4: Redesign `PublicStaffSection`

**Files:**
- Modify: `components/public-staff-section.tsx`

Full rewrite. The `bg-primary` section wrapper is kept. The horizontal list becomes a portrait card grid with cinematic gradient overlays. Owner card (`is_owner === true`) spans 2 columns with a taller aspect ratio and a gold "✦ Owner" badge. Service pills and a "Book" + "View profile" CTA sit overlaid on the gradient at the card bottom.

- [ ] **Step 1: Replace the entire contents of `components/public-staff-section.tsx`**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

import type { StaffMemberWithServices } from "@/lib/types/db";
import { usePublicStaff } from "@/lib/public-content-hooks";
import { StaffModal } from "@/components/StaffModal";

function staffInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PublicStaffSection({ initialStaff }: { initialStaff: StaffMemberWithServices[] }) {
  const { data: staff } = usePublicStaff(initialStaff);
  const [selected, setSelected] = useState<StaffMemberWithServices | null>(null);

  if (staff.length === 0) return null;

  return (
    <>
      <section className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
            Meet the team
          </p>
          <h2 className="mt-3 max-w-xl text-4xl">
            The people behind every treatment.
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {staff.map((member, i) => {
              const isOwner = member.is_owner;
              const serviceNames = member.staff_services
                .map((ss) => ss.services?.name)
                .filter(Boolean) as string[];
              const visibleServices = serviceNames.slice(0, 3);
              const extraCount = serviceNames.length - visibleServices.length;

              return (
                <article
                  key={member.id}
                  className={[
                    "group relative overflow-hidden rounded-xl border border-primary-foreground/10 transition-colors hover:border-champagne/40",
                    isOwner ? "col-span-2" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Photo container with gradient overlay */}
                  <div
                    className={[
                      "relative w-full bg-primary-foreground/10",
                      isOwner ? "aspect-[3/4]" : "aspect-[2/3]",
                    ].join(" ")}
                  >
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        sizes={
                          isOwner
                            ? "(min-width: 640px) 50vw, 100vw"
                            : "(min-width: 640px) 25vw, 50vw"
                        }
                        className="object-cover"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-heading text-3xl font-semibold text-champagne/30">
                        {staffInitials(member.name)}
                      </div>
                    )}

                    {/* Cinematic gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />

                    {/* Owner badge */}
                    {isOwner && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-champagne/40 bg-champagne/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-champagne">
                        <span aria-hidden="true">✦</span> Owner
                      </div>
                    )}

                    {/* Overlaid info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3
                        className={[
                          "font-heading font-bold leading-tight text-primary-foreground",
                          isOwner ? "text-xl" : "text-base",
                        ].join(" ")}
                      >
                        {member.name}, {member.credential}
                      </h3>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-foreground/50">
                        {member.title}
                      </p>

                      {visibleServices.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {visibleServices.map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-champagne/25 bg-champagne/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-champagne"
                            >
                              {name}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="rounded-full border border-champagne/25 bg-champagne/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-champagne">
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {member.booking_url && (
                          <a
                            href={member.booking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-champagne px-3 py-1.5 text-[10px] font-bold text-espresso transition-opacity hover:opacity-90"
                          >
                            Book with {member.name.split(" ")[0]}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelected(member)}
                          className="border-b border-primary-foreground/30 text-[10px] font-semibold text-primary-foreground/55 transition-colors hover:text-primary-foreground/80"
                        >
                          View profile
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {selected && (
        <StaffModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: errors in `StaffModal.tsx` (still accepts `StaffMember`, not `StaffMemberWithServices`). Fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add components/public-staff-section.tsx
git commit -m "feat: redesign staff section with portrait card grid and cinematic overlay"
```

---

### Task 5: Enhance `StaffModal` with side-by-side layout and services

**Files:**
- Modify: `components/StaffModal.tsx`

Photo carousel logic (Supabase fetch, prev/next, keyboard nav, scroll lock) is preserved exactly. Layout changes to side-by-side on `sm+` (desktop). Info panel gains owner badge, full services list, and a full-width booking CTA at the bottom.

- [ ] **Step 1: Replace the entire contents of `components/StaffModal.tsx`**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StaffMemberWithServices, StaffPhoto } from "@/lib/types/db";

function staffInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type Props = {
  member: StaffMemberWithServices;
  onClose: () => void;
};

export function StaffModal({ member, onClose }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("staff_photos")
        .select("photo_url")
        .eq("staff_id", member.id)
        .order("display_order");

      if (cancelled) return;

      const extra = ((data ?? []) as Pick<StaffPhoto, "photo_url">[]).map(
        (p) => p.photo_url
      );
      const all = member.photo_url ? [member.photo_url, ...extra] : extra;
      setPhotos(all);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [member.id, member.photo_url]);

  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1)),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1)),
    [photos.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const serviceNames = member.staff_services
    .map((ss) => ss.services?.name)
    .filter(Boolean) as string[];

  const currentPhoto = photos[index];
  const hasMultiple = photos.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Profile of ${member.name}`}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="size-4" />
        </button>

        {/* Photo carousel — top on mobile, left on sm+ */}
        <div className="relative w-full bg-black sm:w-1/2 sm:shrink-0">
          <div className="relative aspect-square w-full sm:aspect-[3/4]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            ) : currentPhoto ? (
              <Image
                src={currentPhoto}
                alt={`${member.name} photo ${index + 1}`}
                fill
                sizes="(min-width: 640px) 384px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-heading text-4xl font-semibold text-white/30">
                {staffInitials(member.name)}
              </div>
            )}

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`size-2 rounded-full transition-all ${
                      i === index ? "scale-125 bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info panel — bottom on mobile, right on sm+ */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              {member.name}, {member.credential}
            </h2>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {member.title}
            </p>

            {member.is_owner && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-champagne/35 bg-champagne/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-champagne">
                <span aria-hidden="true">✦</span> Owner &amp; Founder
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>

            {serviceNames.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Services offered
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {serviceNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {member.booking_url && (
            <a
              href={member.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-champagne px-5 py-3 text-sm font-bold text-espresso transition-opacity hover:opacity-90"
            >
              Book with {member.name.split(" ")[0]} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/StaffModal.tsx
git commit -m "feat: enhance staff modal with side-by-side layout, owner badge, and services"
```

---

### Task 6: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open `http://localhost:3000/about` and scroll to the staff section**

Verify:
- 4-column portrait grid on desktop, 2-column on mobile
- Owner card is twice as wide (spans 2 cols) with `✦ Owner` gold badge in the top-left
- Service pills (champagne-tinted) appear on cards that have services assigned
- Cards with no services show no service row (no empty space)
- Gold "Book with [Name]" button appears for staff with a booking URL
- "View profile" text link appears on every card

- [ ] **Step 3: Test the modal**

Click "View profile" on any card. Verify:
- Modal opens side-by-side on desktop (photo left, info right)
- Modal stacks on mobile (photo top, info bottom)
- Photo carousel works: prev/next arrows, dot indicators, left/right arrow keys
- Escape key closes modal
- Owner gets `✦ Owner & Founder` badge below their title
- Full services list shows under "Services offered" heading
- `Book with [Name] →` full-width gold button appears at bottom of info panel

- [ ] **Step 4: Test edge cases**

- Staff member with **no photo** — shows initials placeholder instead
- Staff member with **no booking URL** — Book button is absent (not an empty link)
- Staff member with **no services** — services row absent from both card and modal

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: staff section redesign — portrait grid, cinematic overlay, enhanced modal"
```
