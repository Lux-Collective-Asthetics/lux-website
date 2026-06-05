# Admin Image Management & Dynamic Content — Design Spec

**Date:** 2026-05-30  
**Status:** Approved for implementation

---

## Overview

Migrate all Lux Collective content (services, staff, testimonials) from the static `content/site.ts` file to Supabase, add full image management across a new admin panel, and build a public `/gallery` page. The admin panel gets a new collapsible sidebar (21st.dev component style, Lux gold accent), and four new management pages.

---

## 1. Data Model

All tables live in Supabase Postgres. `content/site.ts` is replaced by a one-time seed script that populates the DB on first deploy.

### New Tables

**`staff_members`**
```
id              uuid        PK default gen_random_uuid()
name            text        NOT NULL
credential      text        NOT NULL        -- "CNP", "APRN", etc.
title           text        NOT NULL        -- "Certified Nurse Practitioner"
bio             text        NOT NULL
photo_url       text                        -- Supabase Storage public URL
booking_url     text                        -- per-staff booking link
display_order   integer     NOT NULL default 0
is_visible      boolean     NOT NULL default true
created_at      timestamptz NOT NULL default now()
```

**`staff_services`** (junction — many-to-many)
```
staff_id        uuid        FK → staff_members(id) ON DELETE CASCADE
service_id      uuid        FK → services(id) ON DELETE CASCADE
PRIMARY KEY (staff_id, service_id)
```

**`services`**
```
id              uuid        PK default gen_random_uuid()
name            text        NOT NULL
summary         text        NOT NULL
category        text        NOT NULL        -- matches ServiceGroup names
duration        text                        -- "30–45 min"
hero_image_url  text                        -- Supabase Storage public URL
display_order   integer     NOT NULL default 0
is_visible      boolean     NOT NULL default true
created_at      timestamptz default now()
```

**`service_price_lines`**
```
id              uuid        PK default gen_random_uuid()
service_id      uuid        FK → services(id) ON DELETE CASCADE
label           text        NOT NULL        -- "Per area"
price           text        NOT NULL        -- "$350"
display_order   integer     NOT NULL default 0
```

**`testimonials`**
```
id              uuid        PK default gen_random_uuid()
quote           text        NOT NULL
author          text        NOT NULL
photo_url       text                        -- optional client headshot
is_visible      boolean     NOT NULL default true
display_order   integer     NOT NULL default 0
created_at      timestamptz default now()
```

**`gallery_images`**
```
id              uuid        PK default gen_random_uuid()
title           text        NOT NULL
category        text        NOT NULL        -- "Injectables", "Laser", etc.
before_url      text        NOT NULL        -- Supabase Storage public URL
after_url       text        NOT NULL        -- Supabase Storage public URL
caption         text                        -- e.g. "2 weeks post-treatment"
display_order   integer     NOT NULL default 0
is_visible      boolean     NOT NULL default true
created_at      timestamptz default now()
```

**`newsletter_sends`**
```
id                  uuid        PK default gen_random_uuid()
campaign_name       text        NOT NULL
subject             text        NOT NULL
resend_broadcast_id text        UNIQUE NOT NULL  -- correlates Resend webhook events
sent_at             timestamptz
open_count          integer     NOT NULL default 0
click_count         integer     NOT NULL default 0
recipient_count     integer     NOT NULL default 0
created_at          timestamptz default now()
```

---

## 2. Storage Buckets

Four public-read, authenticated-write buckets in Supabase Storage:

| Bucket              | Used for                         |
|---------------------|----------------------------------|
| `lux-gallery`       | Before/after image pairs         |
| `lux-testimonials`  | Optional client headshots        |
| `lux-services`      | Service hero images              |
| `lux-staff`         | Staff headshots                  |

**RLS policy (all four buckets):**
- `SELECT` — public (no auth required)
- `INSERT` / `UPDATE` / `DELETE` — authenticated users only (admin panel uses service role key via server-side upload route, so bucket-level RLS only needs to block unauthenticated direct uploads)

---

## 3. Admin Sidebar

Replace the current plain sidebar with the 21st.dev collapsible sidebar component, adapted for Lux:

- **Branding:** "L" logo mark in Lux gold (`#c9a96e`), "Lux Collective / Admin Panel" wordmark
- **Active state:** gold tint background (`#fdf5e8`), gold text
- **Collapse toggle:** chevron button on desktop, full hamburger on mobile
- **Search bar:** in expanded state only (cosmetic for now — can wire to page search later)
- **Profile section:** shows logged-in admin name/initials, green online dot
- **Sign out button:** red, at bottom, calls existing `signOut()` action

**Navigation sections:**

| Section    | Items                                      |
|------------|--------------------------------------------|
| Overview   | Dashboard, Analytics (→ Plausible link)    |
| Content    | Gallery, Testimonials, Services, Staff     |
| Marketing  | Subscribers, Newsletters                   |
| Bottom     | Profile card, Sign out                     |

The Analytics item opens the Plausible dashboard URL in a new tab (`NEXT_PUBLIC_PLAUSIBLE_URL` env var). No iframe embed — just a direct link.

**File location:** `components/admin/AdminSidebar.tsx` — extends the 21st.dev component with Lux nav items and gold color scheme.

---

## 4. Admin Pages

All pages live under `app/admin/(protected)/`.

### `/admin/gallery`

- Grid of existing `gallery_images` rows (visible + hidden, ordered by `display_order`)
- Each card shows the before/after pair side-by-side, title, category, visibility toggle (green/grey dot), and a drag handle
- **Upload modal:** title, category (dropdown), caption, before image upload, after image upload — both use the shared `ImageUpload` component targeting the `lux-gallery` bucket
- **Reorder:** drag-and-drop updates `display_order` on drop (optimistic UI, server action persists)
- **Visibility toggle:** flips `is_visible` inline via server action
- **Delete:** confirmation dialog, removes DB row + calls Supabase Storage delete for both URLs

### `/admin/testimonials`

- List of testimonial cards (quote, author, optional photo thumbnail)
- Inline **Add / Edit** form (slide-in panel or modal): quote, author, optional photo upload (`lux-testimonials` bucket)
- Visibility toggle, drag to reorder, delete with confirmation

### `/admin/services`

- Grouped by category (matching existing `ServiceGroup` structure)
- Each service row: name, summary, duration — all editable inline on click
- **Price lines** editable as a mini-list per service: click a price line to edit label/price inline, "+" to add new line, "×" to remove
- **Hero image:** `ImageUpload` component targeting `lux-services` bucket
- Visibility toggle per service
- No add/delete for services (controlled set — adding a new service type is rare enough to do via DB)

### `/admin/staff`

- Cards for each staff member: headshot (or initials avatar), name, credential, title
- **"+ Add Staff Member"** button opens create form with same fields as edit
- Click card to open full **edit panel** (slide-in or full-width form):
  - Name, credential, title, bio (textarea)
  - Photo upload (`lux-staff` bucket)
  - Booking URL (text input)
  - Services offered: multi-select checkboxes from `services` table, persisted to `staff_services`
- Drag to reorder, visibility toggle per staff member
- **Delete** with confirmation (cascades to `staff_services`)

### `/admin/newsletters`

- Table view: Campaign Name, Subject, Sent At, Recipients, Open Rate (%), Click Rate (%)
- Open/click rates calculated as `(open_count / recipient_count * 100)` — displayed as percentages
- **Add campaign row** manually (name, subject, Resend broadcast ID, sent_at, recipient_count) — open/click counts start at 0 and are updated by webhook
- Rows are read-only after creation (counts auto-update via webhook)
- No delete (analytics history is permanent)

### `/admin` (Dashboard)

- Unchanged layout — add quick-stat cards: total gallery images, visible testimonials, active subscribers, last newsletter campaign

---

## 5. Shared Upload Component

**`components/admin/ImageUpload.tsx`**

Props:
```typescript
{
  bucket: 'lux-gallery' | 'lux-testimonials' | 'lux-services' | 'lux-staff'
  onUpload: (publicUrl: string) => void
  currentUrl?: string       // shows existing image
  accept?: string           // defaults to "image/*"
  maxMb?: number            // defaults to 10
}
```

Behavior:
1. Drag-drop zone or click-to-browse (standard `<input type="file">` hidden behind styled zone)
2. On file select: show local preview (`URL.createObjectURL`) immediately
3. On confirm/save: `POST /api/admin/upload` with `FormData` containing `file` + `bucket`
4. Shows upload progress (indeterminate spinner — Cloudflare Workers doesn't stream progress)
5. On success: calls `onUpload(publicUrl)` with the returned URL
6. Error state: inline message, allows retry

---

## 6. API Routes

### `POST /api/admin/upload`

- Auth check: verify Supabase session, reject if not admin email
- Accepts `multipart/form-data`: `file` (Blob) + `bucket` (string)
- Validates: file is an image, size ≤ 10 MB
- Generates filename: `{uuid}.{ext}` to avoid collisions
- Uploads to Supabase Storage using service role key via `supabase.storage.from(bucket).upload(filename, file)`
- Returns `{ url: string }` — the public CDN URL

### `POST /api/webhooks/resend`

- Receives Resend webhook events (configured in Resend dashboard to point at this endpoint)
- Verifies `svix-signature` header using `RESEND_WEBHOOK_SECRET` env var
- Handles event types:
  - `email.opened` → `UPDATE newsletter_sends SET open_count = open_count + 1 WHERE resend_broadcast_id = $1`
  - `email.clicked` → `UPDATE newsletter_sends SET click_count = click_count + 1 WHERE resend_broadcast_id = $1`
- All other event types: 200 no-op
- Uses service role Supabase client

---

## 7. Public Pages

### `/gallery` (new page)

- `app/(public)/gallery/page.tsx`
- Fetches `gallery_images` where `is_visible = true` ordered by `display_order` — server component, no client JS for initial load
- **Filter:** client component wrapper renders filter pills from unique categories in the result set; filters client-side (no refetch)
- **Grid:** masonry-inspired — every 3rd card (`display_order % 3 === 0`) spans 2 columns
- **Card:** before/after split with vertical divider line, category badge top-left, title + caption on hover overlay
- Uses `next/image` for both halves of each card
- Disclaimer footer: "Images are of real Lux Collective clients. Results may vary."

### `/about` (updated)

- Replace static `staff` import from `content/site.ts` with Supabase fetch of `staff_members` where `is_visible = true` ordered by `display_order`
- Each staff card: show `photo_url` via `next/image` if present (falls back to initials avatar)
- Show per-staff booking URL as a "Book with [Name]" button if `booking_url` is set
- Show linked services list (from `staff_services` join) below bio

### `/services` (updated)

- Replace static `serviceGroups` import with Supabase fetch of `services` + `service_price_lines` grouped by `category`
- Existing `ServicesPricingSection` component receives same data shape — minimal refactor
- Service hero image displayed if `hero_image_url` is set

---

## 8. Infrastructure Changes

### `next.config.ts`

Add Supabase Storage CDN to `images.remotePatterns`:
```typescript
{
  protocol: 'https',
  hostname: 'ukmyjostwftmvyrciqrm.supabase.co',
  pathname: '/storage/v1/object/public/**',
}
```

### CSP Headers

Add `https://ukmyjostwftmvyrciqrm.supabase.co` to `img-src` in the existing CSP header configuration.

### New Environment Variables

```
RESEND_WEBHOOK_SECRET=       # from Resend dashboard → Webhooks
NEXT_PUBLIC_PLAUSIBLE_URL=   # your Plausible dashboard URL
```

### Seed Script

`scripts/seed-db.ts` — one-time script that reads `content/site.ts` and inserts all staff, services, service_price_lines, and testimonials into Supabase. Run once after migrations, then `content/site.ts` can be removed or kept as a reference.

---

## 9. Out of Scope

- Plausible analytics embed/iframe in the admin (just a link)
- Newsletter composition/sending (Resend broadcast is set up outside admin)
- Contact inbox in admin (existing "coming soon" card — separate feature)
- Blog management (separate feature)
- Multi-image gallery per treatment (each card is one before/after pair)
- Image cropping/editing (upload as-is)
- Service creation/deletion from admin (controlled set — manage via DB seed or Supabase dashboard)
