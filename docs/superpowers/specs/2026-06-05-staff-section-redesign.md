# Staff Section Redesign

**Date:** 2026-06-05
**Status:** Approved

## Summary

Redesign the public staff section on the About page from a plain horizontal list to a portrait card grid with cinematic gradient overlays, visible service pills, and an enhanced detail modal that shows bio + services + booking CTA. The owner is featured with a wider, taller card and a gold "Owner" badge.

---

## Visual Design

### Card Grid

- **Layout:** 4-column CSS grid on desktop; 2-column on tablet; 1-column on mobile
- **Owner card:** any member with `is_owner === true` spans 2 columns with a taller aspect ratio (`3/4` vs `2/3`) — sorted to the front via `display_order`
- **Photo treatment:** full-bleed photo placeholder fills the card; a gradient overlay runs from `rgba(42,31,24,0.97)` at the bottom to transparent at the top (cinematic style from Option C)
- **Owner badge:** champagne gold pill ("✦ Owner") pinned to top-left of card
- **Overlaid info:** name + credential, title, service pills, Book button, and "View profile" link — all sit on top of the gradient at card bottom
- **Service pills:** omitted from the card if the member has no assigned services
- **"View profile" button:** replaces the current "View photos" label; triggers the same `setSelected` modal
- **Hover state:** subtle champagne border highlight

### Detail Modal (on "View profile" click)

- **Desktop:** side-by-side — photo carousel on the left, info panel on the right
- **Mobile:** stacked — photo on top, info below
- **Info panel contains:**
  - Name, credential, title
  - Owner badge (if `is_owner`)
  - Full bio
  - "Services offered" section with all service name pills (omitted if empty)
  - Full-width gold "Book with [First Name]" CTA button
- **Photo carousel:** unchanged from current implementation (prev/next arrows, dot indicators, keyboard nav)

---

## Data Layer

### Problem

`fetchVisibleStaff` currently selects `staff_members.*` only — services are never fetched for the public page.

### Solution

Update the Supabase query in `fetchVisibleStaff` to join `staff_services` and `services`:

```ts
supabase
  .from("staff_members")
  .select("*, staff_services(service_id, services(id, name))")
  .eq("is_visible", true)
  .order("display_order")
```

Use the existing `StaffMemberWithServices` type (already defined in `lib/types/db.ts`) as the return type. The static fallback in `about/page.tsx` adds `staff_services: []` to each member.

### Types changed

- `fetchVisibleStaff` return type: `StaffMember[]` → `StaffMemberWithServices[]`
- `usePublicStaff` initial/return type: same change
- `PublicStaffSection` prop: same change
- `StaffModal` member prop: same change

---

## Files to Change

| File | Change |
|------|--------|
| `lib/public-content-cache.ts` | Update `fetchVisibleStaff` query + return type |
| `lib/public-content-hooks.ts` | Update `usePublicStaff` type signature |
| `components/public-staff-section.tsx` | Full redesign — portrait grid, gradient overlay, owner badge, service pills |
| `components/StaffModal.tsx` | Enhanced layout — side-by-side, services list, owner badge |
| `app/(public)/about/page.tsx` | Update server query to join services; add `staff_services: []` to static fallback |

---

## Ordering

`display_order` already exists on `staff_members` and is managed in the admin panel — no changes needed. The featured wide-card treatment is determined by `is_owner === true`, not by position. The owner is expected to have `display_order = 0` so they sort to the front, but the wide card renders for any `is_owner` member regardless of position.

---

## Out of Scope

- Admin panel changes
- Adding services to the static `content/site.ts` fallback data (empty array is fine)
- Any change to how `display_order` is edited
