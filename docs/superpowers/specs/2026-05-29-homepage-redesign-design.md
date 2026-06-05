# Homepage & Services Redesign — Design Spec

**Date:** 2026-05-29  
**Status:** Approved via visual brainstorming session

## Goal

Replace the bland gradient hero, remove the three crap stock-photo galleries, and inject three 21st.dev animated components: a WebGL shader hero, a hover-reveal service slideshow, and a scrolling testimonials marquee.

## Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--espresso` | `#2a1f18` | Backgrounds, primary text |
| `--champagne` | `#b89968` | Accent, glows, highlights |
| `--cream` | `#f8f4ee` | Light background, body text on dark |
| `--blush` | `#e8d5cc` | Cards, soft accents |
| `--taupe` | `#d9c9b6` | Borders, muted text |

## Components

### 1. `components/ui/animated-shader-hero.tsx`

- **What:** WebGL canvas that renders animated champagne light trails on an espresso background. Default export is a "use client" component that renders `<canvas className="absolute inset-0 w-full h-full" />`.
- **How used:** Imported via `next/dynamic` with `ssr: false` in `app/(public)/page.tsx`. The section shell and all content (heading, buttons) stay in the server component, rendered as siblings over the canvas using `z-index`.
- **Content on page:** "✦ Newark, Ohio med spa" eyebrow, "Refined aesthetic care, grounded in real results." h1, existing `business.description` subtitle, `<BookButton>` + "View services" link.

### 2. `components/ui/animated-slideshow.tsx`

- **What:** Four exports — `HoverSlider`, `TextStaggerHover`, `HoverSliderImage`, `HoverSliderImageWrap`. Character-level text stagger animation on hover; clip-path image reveal transition.
- **Dependency:** `motion` package (`motion/react`).
- **Data:** Four service groups from `content/site.ts` mapped to slides with local images from `/public`.

| Group | Image |
|-------|-------|
| Injectables | `/injectable-treatment.jpg` |
| Laser Treatments | `/laser-treatment.jpg` |
| Regenerative Treatments | `/skin-treatment.jpg` |
| Wellness | `/hero-med-spa.jpg` |

- **Wrapper:** `ServiceSlideshow` client component in `components/service-slideshow.tsx` — keeps services `page.tsx` as a server component.

### 3. `components/ui/testimonial-marquee.tsx`

- **What:** Three auto-scrolling columns of testimonial cards at different speeds (15s/19s/17s). Cards reveal on scroll-into-view.
- **Dependency:** `motion` package (import from `motion/react`, not `framer-motion`).
- **Data:** `testimonials` array from `content/site.ts` (4 items). All 4 testimonials appear in each column — different scroll speeds create visual variety.
- **No fake headshots:** brand copy says "real imagery only". Initial-based champagne circle avatar instead (e.g. "A" for Amber G.).
- **Palette:** cream card background, espresso text, champagne accent border/ring, taupe border.
- **Exported:** `TestimonialsMarquee` — replaces the existing `<RevealSection className="bg-secondary/50">` testimonials block.

## Page Changes

### `app/(public)/page.tsx`

| Section | Change |
|---------|--------|
| Hero | Replace gradient section → espresso section with `<ShaderCanvas />` background + existing content |
| Info strip | Keep unchanged |
| Services bento | Keep unchanged |
| Photo gallery | **Remove** `RevealSection` with `media.injectable / skinTreatment / laser` |
| Testimonials | Replace static grid → `<TestimonialsMarquee testimonials={testimonials} />` |

Imports removed: `Image`, `media`

### `app/(public)/services/page.tsx`

| Section | Change |
|---------|--------|
| Hero | Keep unchanged |
| Photo row | **Remove** staggered photo grid |
| New section | Add `<ServiceSlideshow />` between hero and pricing cards |
| Pricing cards | Keep unchanged |

Imports removed: `Image`, `media`

## Dependencies

```bash
npm install motion
```

`motion` covers both `animated-slideshow.tsx` (`motion/react`) and `testimonial-marquee.tsx`. No `framer-motion` install needed.

## CSP Note

`img-src 'self' data: blob:` in `next.config.ts` blocks external images. All slideshow images are local `/public` files — no config change needed.
