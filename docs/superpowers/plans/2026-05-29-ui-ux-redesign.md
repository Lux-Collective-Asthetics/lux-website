# UI/UX Redesign — Warm Elevated Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Warm Elevated redesign across all public pages of The Lux Collective website — gradient heroes with blob shapes, icon circles, bento service grid, staggered photo gallery, pill CTAs, and CSS scroll-reveal animations.

**Architecture:** CSS-only animation system added to `globals.css`; `RevealSection` Client Component isolates the only `useEffect` so all pages remain Server Components; design changes are purely additive — no content, metadata, or server actions touched.

**Tech Stack:** Next.js 16.2.6 App Router, React 19, Tailwind v4 (CSS custom properties + arbitrary values), shadcn/ui, `tw-animate-css` (already installed). Build command: `next build --webpack` (Turbopack disabled).

**Spec:** `docs/superpowers/specs/2026-05-29-ui-ux-redesign.md`

---

## File Map

| File | Action |
|------|--------|
| `app/globals.css` | Modify — add keyframes, hero animation classes, reveal classes, reduced-motion overrides |
| `components/shared/reveal-section.tsx` | **Create** — Client Component for scroll-triggered section reveal |
| `components/site-header.tsx` | Modify — add `"use client"`, active route underline, pill BookButton |
| `app/(public)/page.tsx` | Modify — gradient hero + blobs, icon strip, bento services, staggered photos, testimonials |
| `app/(public)/services/page.tsx` | Modify — gradient hero + blobs, staggered photos, gradient group rules, hover cards |
| `app/(public)/about/page.tsx` | Modify — gradient hero + blobs, principle accent bars |
| `app/(public)/contact/page.tsx` | Modify — gradient hero + blobs, icon circles on contact info, bg-card form area |
| `app/(public)/newsletter/page.tsx` | Modify — Sparkles eyebrow icon, subtle gradient section wrap |

---

## Task 1: Animation System — `app/globals.css`

**Files:**
- Modify: `app/globals.css` (append after the `@layer base { … }` block at line 151)

- [ ] **Step 1: Append animation CSS to `globals.css`**

Add the following block at the end of the file (after line 151):

```css
@keyframes lux-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes lux-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: no-preference) {
  .lux-fade-in-1 { animation: lux-fade-in 0.5s ease 0.1s both; }
  .lux-fade-up-3 { animation: lux-fade-up 0.6s ease 0.3s both; }
  .lux-fade-up-5 { animation: lux-fade-up 0.6s ease 0.5s both; }
  .lux-fade-up-7 { animation: lux-fade-up 0.6s ease 0.7s both; }

  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.is-visible {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 2: Commit**

```bash
cd lux-collective
git add app/globals.css
git commit -m "feat: add lux animation keyframes and reveal classes to globals.css"
```

---

## Task 2: Scroll-Reveal Component — `components/shared/reveal-section.tsx`

**Files:**
- Create: `components/shared/reveal-section.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type RevealSectionProps = {
  className?: string;
  children: React.ReactNode;
};

export function RevealSection({ className, children }: RevealSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={cn("reveal", className)}>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd lux-collective
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/reveal-section.tsx
git commit -m "feat: add RevealSection Client Component for scroll-triggered reveal"
```

---

## Task 3: Active Nav + Pill Button — `components/site-header.tsx`

**Files:**
- Modify: `components/site-header.tsx`

The header is currently a Server Component. Adding `usePathname()` requires `"use client"`. `getBookingUrl()` reads `process.env.NEXT_PUBLIC_BOOKING_URL` — a public env var, safe in Client Components.

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BookButton } from "@/components/book-button";
import { getBookingUrl } from "@/lib/booking";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/newsletter", label: "Newsletter" },
];

export function SiteHeader() {
  const bookingUrl = getBookingUrl();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex flex-col" aria-label="The Lux Collective home">
          <span className="font-heading text-2xl leading-none text-primary">
            The Lux Collective
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Aesthetics & Wellness
          </span>
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <nav aria-label="Primary navigation">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      className={cn(
                        "transition-colors hover:text-foreground",
                        isActive && "border-b-2 border-accent font-semibold text-foreground"
                      )}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <BookButton
            bookingUrl={bookingUrl}
            label={bookingUrl ? "Book now" : "Request booking"}
            source="header"
            className="rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/site-header.tsx
git commit -m "feat: add active route underline and pill BookButton to SiteHeader"
```

---

## Task 4: Homepage Redesign — `app/(public)/page.tsx`

**Files:**
- Modify: `app/(public)/page.tsx`

Changes: gradient hero + blobs + entrance animations; icon-circle info strip; bento services grid (5 cards, first spans 2 rows); staggered photo gallery; testimonials with large quote marks + alternating bg.

- [ ] **Step 1: Replace the entire component body (keep metadata + JSON-LD schema at top unchanged)**

The complete new file (keep the existing `metadata`, `localBusinessSchema`, and `export const metadata` block exactly as-is — only replace the `Home()` function and update the imports):

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Mail, MapPin, Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { RevealSection } from "@/components/shared/reveal-section";
import { business, serviceGroups, testimonials } from "@/content/site";
import { media } from "@/content/media";
import { getBookingUrl } from "@/lib/booking";
import { siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${business.name} | Newark, Ohio Med Spa`,
  description: business.description,
  keywords: [
    "med spa Newark Ohio",
    "aesthetics Newark Ohio",
    "botox Newark Ohio",
    "laser treatment Newark Ohio",
    "medical weight loss Newark Ohio",
    "dermal filler Newark Ohio",
    "PRP facial Newark Ohio",
    "hormone replacement therapy Ohio",
  ],
  openGraph: {
    title: business.name,
    description: business.description,
    url: siteUrl,
    type: "website",
    images: [{ url: `${siteUrl}/hero-med-spa.jpg`, width: 1200, height: 900, alt: "The Lux Collective Aesthetics & Wellness" }],
  },
  twitter: {
    card: "summary_large_image",
    title: business.name,
    description: business.description,
    images: [`${siteUrl}/hero-med-spa.jpg`],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: business.name,
  description: business.description,
  url: siteUrl,
  telephone: business.phone,
  email: business.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: "US",
  },
  openingHours: ["Mo 09:00-15:00", "Tu 09:00-18:00", "We 09:00-15:00", "Th 09:00-15:00", "Fr 09:00-15:00", "Sa 09:00-12:00"],
  priceRange: "$$",
};

export default function Home() {
  const bookingUrl = getBookingUrl();
  const featuredServices = serviceGroups.flatMap((group) => group.services).slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[480px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-16 size-80 rounded-full bg-blush opacity-50" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-8 bottom-0 size-56 rounded-full bg-taupe opacity-35" />
        <div aria-hidden="true" className="pointer-events-none absolute right-1/4 top-1/3 size-44 rounded-full bg-blush opacity-40" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="lux-fade-in-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Newark, Ohio med spa
            </p>
            <h1 className="lux-fade-up-3 mt-5 text-5xl text-primary sm:text-6xl lg:text-7xl">
              Refined aesthetic care, grounded in <em>real results.</em>
            </h1>
            <p className="lux-fade-up-5 mt-6 max-w-xl text-lg text-muted-foreground">
              {business.description}
            </p>
            <div className="lux-fade-up-7 mt-8 flex flex-col gap-3 sm:flex-row">
              <BookButton bookingUrl={bookingUrl} source="home_hero" className="rounded-full" />
              <Link
                href="/services"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View services
                <ArrowRight className="size-4" />
              </Link>
            </div>
            {!bookingUrl && (
              <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                Online booking coming soon —{" "}
                <a href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`} className="underline underline-offset-2">
                  call us at {business.phone}
                </a>{" "}
                to schedule.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Info strip */}
      <RevealSection className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="flex items-start gap-3 md:border-r md:border-border md:pr-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
              <MapPin className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Visit The Lux</p>
              <p className="text-sm text-muted-foreground">
                {business.address.street}, {business.address.city}, {business.address.state} {business.address.zip}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 md:border-r md:border-border md:px-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
              <Clock className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Current hours</p>
              <p className="text-sm text-muted-foreground">
                {business.hours?.join(" · ") ?? "Hours unavailable"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 md:pl-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
              <Mail className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-semibold">General inquiries</p>
              <a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={`mailto:${business.email}`}>
                {business.email}
              </a>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Services bento */}
      <RevealSection className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">Services</p>
            <h2 className="mt-3 text-4xl text-primary">A focused menu for skin, injectables, laser, and wellness.</h2>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Full menu <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:[grid-template-columns:1.4fr_1fr_1fr] md:[grid-template-rows:auto_auto]">
          {featuredServices.map((service, i) => (
            <article
              key={service.name}
              className={cn(
                "rounded-lg border p-5 shadow-sm",
                i === 0
                  ? "border-transparent bg-primary text-primary-foreground md:row-span-2"
                  : "border-border bg-card transition-transform hover:-translate-y-1 hover:bg-muted"
              )}
            >
              <h3 className={cn("text-xl", i !== 0 && "text-primary")}>{service.name}</h3>
              <p className={cn("mt-3 text-sm", i === 0 ? "opacity-80" : "text-muted-foreground")}>{service.summary}</p>
              <p className={cn("mt-4 text-sm font-semibold", i !== 0 && "text-foreground")}>{service.priceLines[0]}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      {/* Staggered photo gallery */}
      <RevealSection className="mx-auto grid max-w-7xl gap-4 px-5 pb-14 sm:px-6 md:grid-cols-3 md:items-end lg:px-8">
        {[media.injectable, media.skinTreatment, media.laser].map((item, i) => (
          <div
            key={item.src}
            className={cn(
              "relative overflow-hidden rounded-lg border border-border bg-card",
              i === 1 ? "aspect-[3/4] -mt-6" : "aspect-[4/3]"
            )}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </RevealSection>

      {/* Testimonials */}
      <RevealSection className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl text-4xl text-primary">Real relationships. Real reviews. Real imagery only.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 4).map((testimonial, i) => (
              <figure
                key={testimonial.author}
                className={cn(
                  "rounded-lg border border-border p-5",
                  i % 2 === 0 ? "bg-background" : "bg-card"
                )}
              >
                <span aria-hidden="true" className="block font-heading text-5xl leading-none text-accent opacity-60">&ldquo;</span>
                <blockquote className="mt-2 italic text-muted-foreground">{testimonial.quote}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">{testimonial.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </RevealSection>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/page.tsx
git commit -m "feat: redesign homepage with gradient hero, bento grid, staggered gallery, and reveal animations"
```

---

## Task 5: Services Page — `app/(public)/services/page.tsx`

**Files:**
- Modify: `app/(public)/services/page.tsx`

Changes: gradient hero + blobs with italic `<em>` on heading; staggered photo row (center taller); champagne gradient rule replacing `border-b` under group headers; eyebrow label per group; pill BookButton; card hover lift.

- [ ] **Step 1: Replace the entire file**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { media } from "@/content/media";
import { serviceGroups } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Full services and pricing for The Lux Collective Aesthetics & Wellness in Newark, Ohio — injectables, laser treatments, PRP, medical weight loss, and more.",
  keywords: [
    "botox Newark Ohio",
    "dermal filler Newark Ohio",
    "laser hair removal Newark Ohio",
    "laser photo facial Newark Ohio",
    "vampire facial PRP Newark Ohio",
    "medical weight loss semaglutide Ohio",
    "hormone replacement therapy Ohio",
    "med spa services Newark Ohio",
  ],
  openGraph: {
    title: "Services & Pricing | The Lux Collective",
    description: "Injectables, laser treatments, PRP, weight loss, and hormone therapy in Newark, Ohio.",
    url: "https://theluxcollectiveaesthetics.com/services",
  },
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ServicesPage() {
  const bookingUrl = getBookingUrl();

  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-12 size-72 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-12 size-52 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Services and pricing
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Treatment options for refreshed skin, natural structure, and <em>wellness support.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Pricing is listed from the current public menu. Some treatments require consultation, and final recommendations are made by the provider.
            </p>
          </div>
        </div>
      </section>

      {/* Staggered photo row */}
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:px-6 md:grid-cols-3 md:items-end lg:px-8">
        {[media.injectable, media.skinTreatment, media.laser].map((item, i) => (
          <div
            key={item.src}
            className={cn(
              "relative overflow-hidden rounded-lg border border-border bg-card",
              i === 1 ? "aspect-[3/4] -mt-6" : "aspect-[4/3]"
            )}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Service groups */}
      <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {serviceGroups.map((group) => (
            <section key={group.name} aria-labelledby={`${slug(group.name)}-heading`}>
              <div className="relative flex flex-col justify-between gap-3 pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">The Lux Collective</p>
                  <h2 id={`${slug(group.name)}-heading`} className="text-3xl text-primary">
                    {group.name}
                  </h2>
                </div>
                <BookButton
                  bookingUrl={bookingUrl}
                  label={bookingUrl ? "Book this service" : "Ask about booking"}
                  source={`services_${group.name.toLowerCase().replaceAll(" ", "_")}`}
                  className="rounded-full"
                />
                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-champagne via-taupe to-transparent" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <article key={service.name} className="rounded-lg border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-1 hover:bg-muted">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl text-primary">{service.name}</h3>
                      {service.duration ? (
                        <span className="rounded-md bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {service.duration}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{service.summary}</p>
                    <ul className="mt-5 space-y-2 text-sm font-medium">
                      {service.priceLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/services/page.tsx
git commit -m "feat: redesign services page with gradient hero, staggered photos, and gradient group headers"
```

---

## Task 6: About Page — `app/(public)/about/page.tsx`

**Files:**
- Modify: `app/(public)/about/page.tsx`

Changes: replace 50/50 grid hero with gradient hero + blobs; italic `<em>` on heading; pill BookButton; champagne accent bar above each principle card. The lounge photo is removed from the hero (blobs provide the visual texture). `Image` and `media` imports are removed since they are no longer used.

- [ ] **Step 1: Replace the entire file**

```tsx
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { BookButton } from "@/components/book-button";
import { business, brandPrinciples } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about The Lux Collective Aesthetics & Wellness — a science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
  openGraph: {
    title: "About | The Lux Collective",
    description: "A science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
    url: "https://theluxcollectiveaesthetics.com/about",
  },
};

export default function AboutPage() {
  const bookingUrl = getBookingUrl();

  return (
    <div>
      {/* Gradient hero */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-10 size-64 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 left-16 size-48 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Welcome to The Lux
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Premium med-spa care with a warm, <em>human center.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {business.shortName} specializes in results-driven treatments backed by science and delivered with precision. The experience is elevated, but the goal is simple: help every client feel informed, comfortable, and confident.
            </p>
            <div className="mt-8">
              <BookButton bookingUrl={bookingUrl} source="about" className="rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Brand principles */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-primary">Built around trust from the start.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {brandPrinciples.map((principle) => (
              <div key={principle} className="rounded-lg border border-border bg-background p-5">
                <div className="mb-3 h-0.5 w-7 rounded bg-accent" />
                <p className="text-sm font-medium text-muted-foreground">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/about/page.tsx
git commit -m "feat: redesign about page with gradient hero, blobs, and principle accent bars"
```

---

## Task 7: Contact Page — `app/(public)/contact/page.tsx`

**Files:**
- Modify: `app/(public)/contact/page.tsx`

Changes: separate gradient hero section; form + info wrapped in `bg-card` section (inputs are `bg-transparent` so they inherit the warm card background); icon circles on all contact info items (Email, Phone, Location, Hours).

- [ ] **Step 1: Replace the entire file**

```tsx
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { business } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Lux Collective Aesthetics & Wellness in Newark, Ohio for general inquiries.",
};

export default function ContactPage() {
  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-[320px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-8 size-60 rounded-full bg-blush opacity-45" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-8 size-44 rounded-full bg-taupe opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="size-4 text-accent" />
              Contact
            </p>
            <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
              Questions, booking help, or <em>general inquiries.</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Send a general message below. For appointments, use the booking link — or call during business hours.
            </p>
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ContactForm />

            <div className="space-y-4">
              <a
                className="flex gap-4 rounded-lg border border-border bg-background p-5 transition-colors hover:bg-muted"
                href={`mailto:${business.email}`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Mail className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Email</p>
                  <p className="mt-1 text-sm text-muted-foreground">{business.email}</p>
                </div>
              </a>

              <a
                className="flex gap-4 rounded-lg border border-border bg-background p-5 transition-colors hover:bg-muted"
                href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Phone className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Phone</p>
                  <p className="mt-1 text-sm text-muted-foreground">{business.phone}</p>
                </div>
              </a>

              <div className="flex gap-4 rounded-lg border border-border bg-background p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <MapPin className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Location</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {business.address.street}
                    <br />
                    {business.address.city}, {business.address.state} {business.address.zip}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-lg border border-border bg-background p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Clock className="size-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Hours</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {business.hours.map((hour) => (
                      <li key={hour}>{hour}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/contact/page.tsx
git commit -m "feat: redesign contact page with gradient hero, icon circles, and warm form area"
```

---

## Task 8: Newsletter Page — `app/(public)/newsletter/page.tsx`

**Files:**
- Modify: `app/(public)/newsletter/page.tsx`

Changes: add `Sparkles` icon to the existing eyebrow label; wrap content in a `bg-gradient-to-b from-background to-card` section.

- [ ] **Step 1: Replace the entire file**

```tsx
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { SubscribeForm } from "@/components/subscribe-form";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Stay in the loop on treatments, specials, and wellness tips from The Lux Collective.",
};

export default function NewsletterPage() {
  return (
    <section className="bg-gradient-to-b from-background to-card">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
          <Sparkles className="size-4 text-accent" />
          Newsletter
        </p>
        <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
          Stay in the loop.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Occasional updates on new treatments, seasonal specials, and wellness tips — straight from the team. No spam, unsubscribe any time.
        </p>

        <div className="mt-10 max-w-sm">
          <SubscribeForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/newsletter/page.tsx
git commit -m "feat: add sparkles eyebrow and gradient wrap to newsletter page"
```

---

## Task 9: Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full production build**

```bash
cd lux-collective
npm run build
```

Expected: build completes without TypeScript errors or module-not-found errors. The `next build --webpack` flag is already set in `package.json`.

- [ ] **Step 2: Start dev server and spot-check all pages**

```bash
npm run dev
```

Check each route in a browser:
- `/` — gradient hero with blobs, icon strip, bento grid, staggered photos, testimonials with quote marks
- `/services` — gradient hero, staggered photo row, gradient group-header rules, card hover
- `/about` — gradient hero, principle cards with champagne accent bars
- `/contact` — gradient hero, icon circles on Email/Phone/Location/Hours
- `/newsletter` — sparkles eyebrow, gradient background

Also verify:
- Nav active underline shows on the current page (champagne underline + bold text)
- Book button is pill-shaped on all public pages
- Scroll down to check reveal animations fire (sections fade in as they enter the viewport)
- Check at `prefers-reduced-motion: reduce` (devtools → Rendering → Emulate CSS media feature) — all sections should be immediately visible, no animations

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify warm elevated redesign build and visual qa"
```
