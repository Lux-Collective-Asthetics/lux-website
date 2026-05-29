# UI/UX Redesign — The Lux Collective
**Date:** 2026-05-29  
**Scope:** Full public site — homepage, services, about, contact, header, footer  
**Design direction:** Warm Elevated  
**Motion:** Moderate CSS-only (no new dependencies)  
**Stack constraint:** Next.js 16, React 19, Tailwind v4, shadcn/ui, deployed to Cloudflare Workers via OpenNext

---

## Design Direction: Warm Elevated

All changes operate within the existing brand palette and font stack — nothing is replaced.

**Palette (unchanged):**
- `--cream` `#f8f4ee` — background
- `--espresso` `#2a1f18` — primary text / dark surfaces
- `--champagne` `#b89968` — gold accent
- `--taupe` `#d9c9b6` — secondary
- `--blush` `#e8d5cc` — soft accent
- `--muted-foreground` `#6d5a4a` — body text

**Fonts (unchanged):**
- Headings: `DM Serif Display` — use more boldly with italic `<em>` for warmth
- Body: `Inter`

**New visual vocabulary introduced:**
1. **Gradient backgrounds** — `linear-gradient(145deg, --cream → --blush)` on all hero/page-header sections
2. **Organic blob shapes** — absolutely-positioned `border-radius: 50%` divs in blush/taupe at low opacity (0.35–0.55); purely decorative, `aria-hidden`
3. **Pill CTAs** — `border-radius: 9999px` on all buttons throughout (primary and outline variants)
4. **Champagne accent bar** — `3px` tall, `28px` wide, `background: --champagne`, `border-radius: 2px`; used on principle cards and as a micro-detail
5. **Champagne gradient rule** — `linear-gradient(to right, --champagne, --taupe 40%, transparent)` used as group-header divider on services page
6. **Icon circles** — `36–40px` circle in `--blush` background for contact/info icon containers
7. **Staggered photo layout** — center image `~20px` taller than flanking images, `margin-top: -20px` to create a raised center effect

---

## Animation System (CSS-only)

Two `@keyframes` added to `globals.css`:

```css
@keyframes lux-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes lux-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

**Hero entrance** — staggered `animation-delay` on each hero child:
- Eyebrow label: `lux-fade-in 0.5s ease 0.1s both`
- Heading: `lux-fade-up 0.6s ease 0.3s both`
- Body text: `lux-fade-up 0.6s ease 0.5s both`
- CTA buttons: `lux-fade-up 0.6s ease 0.7s both`

**Scroll-triggered sections** — a `<RevealSection>` Client Component (`components/shared/reveal-section.tsx`) wraps sections that should fade in on scroll. It attaches an `IntersectionObserver` to its own `ref` and adds `is-visible` once it enters the viewport (threshold `0.15`). Server Component pages can use it as a wrapper — only the wrapper itself needs `"use client"`, not the page.

```css
.reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.is-visible { opacity: 1; transform: none; }
```

**Reduced motion** — wrap the `.reveal` rule in `@media (prefers-reduced-motion: no-preference)`. Also add:
```css
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

**Hover states** (consistent throughout):
- Cards: `translateY(-3px)` + subtle background tone shift
- Pill buttons: slight scale `1.02` or background lightening
- Nav links: color to `--foreground`

---

## Component Changes

### `components/ui/button.tsx`
- Do **not** change the base `rounded-lg` default — that would break admin buttons, icon buttons, and grouped buttons
- All public-facing pill CTAs pass `className="rounded-full"` at the call site (BookButton, inline Link CTAs)

### `SiteHeader`
- Active route: champagne underline (`border-b-2 border-accent`) + `font-semibold`; detect with `usePathname()` — makes the header a Client Component (`"use client"`)
- Nav link hover: `color: --foreground` transition (already exists, keep)
- Book button: add `className="rounded-full"` on the BookButton call
- No layout change

### `SiteFooter`
- No changes needed

---

## Page Changes

### Homepage (`app/(public)/page.tsx`)

**Hero section** (replaces current 50/50 grid):
- Full-width `min-h-[480px]` section with gradient background + 3 blob divs
- Left-aligned content block (max-w-xl), no photo column — blobs provide the visual texture
- Heading uses `<em>` italic on last phrase
- CTAs changed to `rounded-full`
- Booking-unavailable fallback message preserved

**Info strip** (replaces current 3-col plain text):
- Icon circle (36px, `bg-blush`) + label + value per item
- Vertical `1px` dividers between items at `md:` breakpoint
- Background: `bg-card` (unchanged)

**Services section**:
- Replace uniform 6-card grid with **bento layout**: `grid-template-columns: 1.4fr 1fr 1fr` / `grid-template-rows: auto auto`
- Change slice from `slice(0, 6)` to `slice(0, 5)` — bento needs exactly 5 items (1 large + 4 small)
- First card spans `row-span-2`, uses `bg-primary text-primary-foreground` (espresso dark)
- Remaining 4 cards: standard `bg-card` with hover lift
- "Full menu →" link preserved

**Photo gallery** (between services and testimonials):
- 3-column grid preserved, add `align-items: end`
- Center image: add `aspect-[3/4]` (taller), outer two keep `aspect-[4/3]`
- Center gets `mt-[-1.5rem]` so it rises above the grid baseline

**Testimonials section**:
- Each `<figure>`: add large `"` quotation mark (champagne, `text-5xl`, `font-heading`, `leading-none`, `opacity-60`) before `<blockquote>`
- Quote text: add `italic`
- Cards: alternate bg — odd cards `bg-background`, even cards `bg-card`
- Section background: `bg-secondary/50` (unchanged)

---

### Services page (`app/(public)/services/page.tsx`)

**Page header**:
- Replace plain `div` with gradient hero section matching homepage style
- 2 blob elements
- Italic `<em>` on "wellness support"

**Photo row**: same staggered treatment as homepage gallery (center taller, `mt-[-1.5rem]`)

**Service group headers**:
- Replace `border-b border-border` with gradient rule via `bg-gradient-to-r from-champagne via-taupe to-transparent h-px` absolutely positioned under a relative container
- Add `section-label` eyebrow above group name (not present currently)

**Service cards**:
- Add `transition-transform hover:-translate-y-1` and `hover:bg-muted`
- Duration badge: promote visibility, keep current markup
- Price lines: wrap in its own sub-section with a subtle top rule

---

### About page (`app/(public)/about/page.tsx`)

**Hero section**: gradient background + blob elements, consistent with other pages

**Brand principles grid**:
- Each principle card: add champagne accent bar (`w-7 h-0.5 bg-accent rounded mb-3`) above text
- Remove plain border box feel — keep border but pair with accent bar

---

### Contact page (`app/(public)/contact/page.tsx`)

**Page header**: gradient hero, consistent with other pages

**Contact form layout**:
- Already has a form — add `bg-card` section background for the form+info layout
- Form inputs: ensure `bg-muted` fill (warm tone, already in palette) rather than white
- Contact info items: wrap icon in circle div (`size-9 rounded-full bg-blush flex items-center justify-center`)

### Newsletter page (`app/(public)/newsletter/page.tsx`)

Light treatment only — no blobs (the page is intentionally minimal around the form):
- Add eyebrow label above the `<h1>` (same pattern as other pages)
- Wrap in a subtle `bg-gradient-to-b from-background to-card` section so it doesn't look completely flat
- No structural changes; `SubscribeForm` component untouched

---

## New File: `components/shared/reveal-section.tsx`

Client Component wrapping a `<section>` (or any element via `as` prop). Attaches `IntersectionObserver` on mount, adds `is-visible` class when the element enters the viewport at threshold `0.15`. Calls `disconnect()` on unmount.

```tsx
// usage in a Server Component page:
// <RevealSection className="reveal ..."><p>content</p></RevealSection>
```

No external dependency. The `"use client"` directive is isolated to this file only.

---

## Unchanged

- All metadata, JSON-LD, sitemap, robots — untouched
- All server actions (contact form, newsletter, unsubscribe) — untouched
- Admin routes — untouched
- Content files (`content/site.ts`, `content/media.ts`) — untouched
- Booking logic — untouched
- Dark mode CSS variables — untouched (dark mode not surfaced with a toggle; variables stay for future use)

---

## Build Order

1. `app/globals.css` — add `@keyframes lux-fade-up`, `@keyframes lux-fade-in`, `.reveal` + `.reveal.is-visible`, reduced-motion overrides
2. `components/shared/reveal-section.tsx` — new Client Component for scroll-triggered sections
3. `components/site-header.tsx` — add `"use client"`, active route underline via `usePathname()`, `rounded-full` on BookButton
4. `app/(public)/page.tsx` — full homepage redesign (gradient hero + blobs, info strip icon circles, services bento slice(0,5), staggered photos, testimonials quote marks)
5. `app/(public)/services/page.tsx` — gradient hero + blobs, staggered photos, champagne gradient group-header rule, card hover lift
6. `app/(public)/about/page.tsx` — gradient hero + blobs, principle card accent bars
7. `app/(public)/contact/page.tsx` — gradient hero + blobs, icon circles on contact info, `bg-muted` form inputs
8. `app/(public)/newsletter/page.tsx` — eyebrow label, subtle bg gradient
