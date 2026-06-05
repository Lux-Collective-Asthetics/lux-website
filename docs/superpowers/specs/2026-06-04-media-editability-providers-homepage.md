# Media Editability, Homepage Providers & Gallery Readiness — Design Spec

**Date:** 2026-06-04  
**Status:** Approved for implementation

---

## Overview

Three related features that bring the remaining hardcoded images under admin control and add a staff showcase to the homepage:

1. **Service category images** — add `image_url` to `service_categories` table so each category can have a custom photo, overriding the static fallbacks used by the service slideshow (`/services`) and the parallax scroll sections on the homepage.
2. **Homepage providers section** — a compact "Meet our providers" section on the homepage, rendered from the existing `staff_members` table (same data already editable in `/admin/staff`).
3. **Gallery readiness** — the `about_gallery` admin and `AboutGallery` public component are already implemented; this feature confirms they're production-ready and documents the remaining Supabase setup steps.

---

## 1. Service Category Images

### Problem
`service-slideshow.tsx` and `LuxFeaturesScroll` (in `text-parallax-scroll.tsx`) both use hardcoded image paths (`/injectable-treatment.jpg`, `/laser-treatment.jpg`, etc.). There is no way to update these without a code deploy.

### Solution
Add an optional `image_url` text column to `service_categories`. When a category has a custom image set via admin, it overrides the static fallback everywhere that column is read.

### Data model

**Migration `004_service_category_images.sql`**
```sql
alter table service_categories add column if not exists image_url text;
```

**Type update — `ServiceCategory` in `lib/types/db.ts`**
```ts
image_url: string | null
```

### Admin — category image upload

In `ServicesClient.tsx`, the category manager panel changes from a pill list to a card list. Each row shows:
- Small thumbnail (or image placeholder icon if no image)
- Category name
- "Edit image" icon button — toggles an inline `<ImageUpload bucket="lux-services" />` below the row
- Delete category button (unchanged)

New server action `updateServiceCategoryImage(id, imageUrl | null)` in `services/actions.ts`.
New prop `onUpdateCategoryImage` threaded through `services/page.tsx` → `ServicesClient`.

### Public — resolving images

**Fallback map** (used when `image_url` is null):
| Keyword match (case-insensitive) | Fallback image |
|---|---|
| `injectable` | `/injectable-treatment.jpg` |
| `laser` | `/laser-treatment.jpg` |
| `regenerative`, `prp` | `/skin-treatment.jpg` |
| `wellness`, `weight`, `hormone` | `/hero-med-spa.jpg` |
| _(no match)_ | `/hero-med-spa.jpg` |

**`lib/public-content-cache.ts`** — add `fetchServiceCategories()` (returns empty array gracefully if table missing).

**`lib/public-content-hooks.ts`** — add `usePublicServiceCategories(initialCategories)` hook with `initialDataUpdatedAt: STALE_AT_ZERO` pattern.

**`service-slideshow.tsx`** — accepts `initialCategories: ServiceCategory[]` prop, uses hook. Shows one slide per DB category (with resolved image). Falls back to 4 static slides when DB is empty.

**`LuxFeaturesScroll` (`text-parallax-scroll.tsx`)** — accepts `initialCategories: ServiceCategory[]` prop. Keeps its 3 hardcoded parallax sections; resolves each section's `imgSrc` from the matching DB category or static fallback.

**Pages** — `app/(public)/services/page.tsx` and `app/(public)/page.tsx` each fetch categories server-side (graceful try/catch), pass as `initialCategories` prop.

---

## 2. Homepage Providers Section

### Problem
The staff section only appears on `/about`. The homepage has no mention of the team ("the girls"), which reduces trust and social proof on the most-visited page.

### Solution
A new `HomepageProviders` client component that shows a compact provider grid on the homepage. It re-uses the existing `usePublicStaff` hook and the same `staff_members` data already editable in `/admin/staff`.

### Component — `components/homepage-providers.tsx`

**Layout** (placed between `LuxFeaturesScroll` and `HomepageTestimonials`):

```
"Our providers"  eyebrow
"The people behind every result."  h2

[Provider cards — 2 cols mobile, 4 cols lg]
  photo (square, rounded-lg) or initials avatar
  name + credential  (bold)
  title  (xs muted)

"Meet the full team →"  link to /about
```

- Uses `usePublicStaff(initialStaff)` — live-updates when staff changes in admin without page reload.
- `initialStaff` fetched SSR in `app/(public)/page.tsx` via `supabase.from("staff_members")`.
- Static fallback: maps `content/site.ts` `staff` array to `StaffMember[]` shape (same pattern as `about/page.tsx`).
- No booking buttons (feature not yet live).
- "View photos" button omitted from homepage — just name/credential/title.

---

## 3. Gallery Readiness

### What's already done
- `app/admin/(protected)/about-gallery/` — full CRUD admin with `AboutGalleryClient.tsx`
- `components/AboutGallery.tsx` — public masonry-style grid with lightbox
- `app/(public)/about/page.tsx` — passes SSR `initialPhotos` to `AboutGallery`
- `lib/public-content-hooks.ts` — `useAboutGallery` hook with `initialDataUpdatedAt: STALE_AT_ZERO`

### What's needed (user action)
1. **Run migration `002_staff_photos_about_gallery.sql`** in Supabase Dashboard → SQL Editor (creates `about_gallery` and `staff_photos` tables).
2. **Create `lux-staff` storage bucket** (Public: Yes) in Supabase Dashboard → Storage.
3. **Create `lux-services` storage bucket** (Public: Yes) in Supabase Dashboard → Storage.
4. **Upload photos** via `/admin/about-gallery` and `/admin/staff`.

### What's needed (code)
No additional code changes required for gallery. The admin and public components are complete.

---

## Build Sequence

1. `004_service_category_images.sql` migration
2. `lib/types/db.ts` — add `image_url` to `ServiceCategory`
3. `services/actions.ts` — add `updateServiceCategoryImage`
4. `services/page.tsx` — pass `onUpdateCategoryImage` prop
5. `ServicesClient.tsx` — category card layout with image upload
6. `lib/public-content-cache.ts` — `fetchServiceCategories`, update query keys
7. `lib/public-content-hooks.ts` — `usePublicServiceCategories`
8. `service-slideshow.tsx` — DB-driven with static fallback
9. `text-parallax-scroll.tsx` — DB image resolution per section
10. `services/page.tsx` — fetch + pass categories
11. `components/homepage-providers.tsx` — new component
12. `app/(public)/page.tsx` — fetch staff + categories, add `HomepageProviders`

---

## Supabase Buckets Required

| Bucket | Public | Used by |
|---|---|---|
| `lux-staff` | Yes | Staff headshots, about gallery, staff extra photos |
| `lux-services` | Yes | Service hero images, category images |
| `lux-gallery` | Yes | Before/after gallery images |
| `lux-testimonials` | Yes | Testimonial photos |
