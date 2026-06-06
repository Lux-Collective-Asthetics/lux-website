# Services Redesign

**Date:** 2026-06-05  
**Status:** Approved

## Overview

Three interconnected problems: the public services page shows everything at once (cluttered), the slideshow's character-by-character hover animation is being replaced with a cleaner category-nav approach, and the admin page has no filtering so managing many services is painful. Additionally, category deletion had no safety net — deleting a category could orphan or silently lose services.

---

## Section 1 — Public Services Page

### Page Structure (top to bottom)

1. **Hero** — unchanged
2. **Slideshow** — medium height (~350px). Replaces animated character hover with plain hoverable category names.
3. **Grid** — sidebar filter + filtered service cards. Connected to slideshow via URL search param.

### Slideshow Component

**Layout:**
- Left column (~280px): vertical list of category names. Plain text, no character animation. Hover highlights the active category.
- Right panel (flex-grow): category image with existing clip-path reveal animation (keep — it's good).
- Below the two-panel area: a **quick-preview strip** that fades in on hover.

**Quick-preview strip:**
- Triggered by hovering a category name.
- Shows that category's visible services as slim horizontal cards (scrollable if overflow).
- Each card: service name, one-line summary (existing `summary` field, truncated with CSS line-clamp), price.
- A "View all →" link at the end.
- Animation: fade + slide-up, 150ms. Fast.

**Click behavior:**
- Clicking a category name, a preview card, or "View all →" sets `?category=<slug>` in the URL and smooth-scrolls to the grid section below. Slug = category name lowercased with spaces replaced by hyphens (e.g. "Facials & Skin" → `facials-&-skin`). Matching is done case-insensitively on the name field, not stored in DB.

### Services Grid

**Layout:**
- Sticky sidebar on the left: lists all categories. Active category (from `?category` URL param) is highlighted. Clicking a different category updates the URL param.
- Right side: service cards for the active category only. If no param is present, the first non-system category by `display_order` is selected by default.

**Service card:**
- Name + duration badge
- One-line summary
- Price (first price line or "from" price)
- Click opens the existing detail modal (unchanged)

**Category changes:**
- Grid fades out old services, fades in new (100ms). No full page navigation — URL update is shallow (`router.replace` with `scroll: false`).

**"Other" category visibility:**
- Shown in sidebar and grid only if it has at least one visible service.
- Never shown in the slideshow.

---

## Section 2 — Category & Data Logic

### Database Changes

**New column:** `service_categories.is_system` (boolean, default false)  
**New column:** `services.category_id` (UUID, FK → `service_categories.id`, nullable)

- `category_id` becomes the source of truth. The existing `category` text field is kept for display/fallback but no longer drives filtering.
- Migration backfills `category_id` by matching the existing `category` text to `service_categories.name`.

**"Other" system category:**
- Created once via migration: `name = 'Other'`, `is_system = true`, `display_order = 9999`.
- `is_system = true` categories cannot be deleted (enforced in server action and UI).
- Hidden from public page and slideshow when it has zero visible services.

### Category Deletion Flow

**Category has zero services:** deletes immediately, no prompt.

**Category has one or more services:**
1. Admin clicks delete → modal appears: *"This category has N services. Choose a category to move them to, or they'll go to Other."*
2. Dropdown lists all other non-system categories.
3. Admin picks a target (optional) → confirm.
4. Server action: reassigns all services in that category to the chosen `category_id` (or "Other" if none chosen), then deletes the category.
5. Cache revalidated for `/services`, `/admin/services`, `/`.

**Constraint:** `is_system = true` categories — delete button is disabled in admin UI, tooltip: "System category — cannot be deleted."

### Service Category Assignment

- Creating a service: `category_id` is required. Defaults to first non-system category.
- Editing a service: `category_id` can be changed via dropdown in the edit form.

---

## Section 3 — Admin Services Page

### Layout

**Top:** Collapsible "Manage Categories" panel (already exists). Made more prominent:
- Each category row shows name, display order, a thumbnail if `image_url` is set, and an "Upload Photo" button (uses existing `ImageUpload` component).
- Delete button disabled for `is_system` categories.

**Below Manage Categories:** Category filter tabs — one tab per category. Clicking a tab shows only that category's services. No "All" tab — one category at a time.

**Services list (per active category):**
- Service rows: name, visibility toggle, price summary, Edit / Delete buttons.
- Drag-to-reorder within the active category (existing behavior, scoped to filtered view).
- "Add Service" button is scoped to the active category — pre-fills `category_id`.

### Delete Service

Unchanged — confirmation dialog, cascades to price lines.

### Delete Category

Triggers the reassignment modal described in Section 2.

### Image Management

Category images are managed in the "Manage Categories" panel. Per-service hero images are not used — category images in the slideshow are sufficient.

---

## Animations Summary

| Interaction | Animation |
|---|---|
| Hover category in slideshow | Clip-path image reveal (existing, keep) |
| Quick-preview strip appears | Fade + slide-up, 150ms |
| Category change in grid | Fade out → fade in, 100ms |
| Category change in admin | Instant (no animation needed) |
| Character-by-character text | **Removed** |

---

## Files Affected

### New / heavily modified
- `components/service-slideshow.tsx` — rebuilt: category list + image panel + preview strip
- `components/ui/animated-slideshow.tsx` — `TextStaggerHover` removed or gutted; `HoverSliderImage` kept
- `components/services-pricing-section.tsx` — add URL param filter logic
- `app/(public)/services/page.tsx` — pass `searchParams` to grid, handle default category
- `app/admin/(protected)/services/ServicesClient.tsx` — add category tabs, scoped add/delete
- `app/admin/(protected)/services/actions.ts` — update `deleteServiceCategory` with reassignment logic

### New
- `supabase/migrations/005_services_category_id.sql` — adds `category_id`, `is_system`, creates "Other" category, backfills
- `components/admin/DeleteCategoryModal.tsx` — reassignment modal

### Unchanged
- `app/api/admin/upload/route.ts`
- `components/admin/ImageUpload.tsx`
- `lib/public-content-cache.ts` (minor: filter by `category_id`)
- `lib/public-content-hooks.ts`
- Detail modal in `services-pricing-section.tsx`
