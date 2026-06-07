# Booking Flow Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `BookButton` CTA with a two-path `BookingCTA` component (new patients → `/contact`, existing patients → FMH portal), update booking copy site-wide, and add a "How Booking Works" explainer section to the Services page.

**Architecture:** Create `BookingCTA` with three layout variants (`cards`, `compact`, `stacked`) plus an `inverted` color scheme for dark-background contexts. Replace all four `BookButton` usage sites, update stale copy in the services modal, then add a `HowBookingWorks` server component to the services page between the hero and the service slideshow.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4 (CSS custom-property tokens, no `tailwind.config.ts`), shadcn/ui, TypeScript strict, Lucide icons, `motion/react` for hero animations.

> **Note for implementors:** `AGENTS.md` requires reading `node_modules/next/dist/docs/` before writing code. Check it for any breaking-change notes relevant to Link, Image, or Server Component usage before editing.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| **Create** | `components/booking-cta.tsx` | Two-path CTA replacing `BookButton` everywhere |
| **Create** | `components/how-booking-works.tsx` | Step-flow booking explainer section |
| **Modify** | `components/lux-hero.tsx` | Replace `BookButton`, remove "coming soon" fallback text |
| **Modify** | `components/site-header.tsx` | Replace `BookButton` with compact two-button CTA |
| **Modify** | `components/services-pricing-section.tsx` | Replace 2× `BookButton`, update "Booking" detail copy |
| **Modify** | `app/(public)/about/page.tsx` | Replace `BookButton` |
| **Modify** | `app/(public)/services/page.tsx` | Import `HowBookingWorks` and insert between hero and slideshow |
| **Delete** | `components/book-button.tsx` | No remaining usages after above changes |

---

### Task 1: Create `BookingCTA` component

**Files:**
- Create: `components/booking-cta.tsx`

- [ ] **Step 1: Write the component**

Create `components/booking-cta.tsx` with this exact content:

```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CalendarDays, LogIn } from "lucide-react";

import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type BookingCTAProps = {
  bookingUrl: string | null;
  source: string;
  className?: string;
  variant?: "cards" | "compact" | "stacked";
  colorScheme?: "default" | "inverted";
};

export function BookingCTA({
  bookingUrl,
  source,
  className,
  variant = "cards",
  colorScheme = "default",
}: BookingCTAProps) {
  const portalHref = bookingUrl ?? "/contact";
  const isExternal = Boolean(bookingUrl);
  const inv = colorScheme === "inverted";

  useEffect(() => {
    if (!bookingUrl) {
      console.warn(
        "[BookingCTA] NEXT_PUBLIC_BOOKING_URL is not set. " +
          "'Log In to Book' falls back to /contact.",
      );
    }
  }, [bookingUrl]);

  const requestTrack = () =>
    track("book_click", { source, destination: "contact_new_patient" });
  const portalTrack = () =>
    track("book_click", {
      source,
      destination: isExternal ? "fmh_portal" : "contact_fallback",
    });

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Link
          href="/contact"
          onClick={requestTrack}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
            inv
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Request an Appointment
        </Link>
        <Link
          href={portalHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={portalTrack}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
            inv
              ? "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              : "border border-border text-foreground hover:bg-muted",
          )}
        >
          <LogIn className="size-3.5" aria-hidden="true" />
          Log In to Book
        </Link>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Link
          href="/contact"
          onClick={requestTrack}
          className={cn(
            "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
            inv
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Request an Appointment
        </Link>
        <Link
          href={portalHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={portalTrack}
          className={cn(
            "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
            inv
              ? "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              : "border border-border text-foreground hover:bg-muted",
          )}
        >
          <LogIn className="size-3.5" aria-hidden="true" />
          Log In to Book
        </Link>
      </div>
    );
  }

  // cards variant (default) — two equally-weighted side-by-side cards
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="flex flex-col rounded-xl border border-border bg-card p-5">
        <div className="flex size-9 items-center justify-center rounded-full bg-blush">
          <CalendarDays className="size-4 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
          New Patient
        </p>
        <p className="mt-1.5 grow text-sm text-muted-foreground">
          First time with us? Fill out a quick form and we'll reach out to confirm your visit.
        </p>
        <Link
          href="/contact"
          onClick={requestTrack}
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Request an Appointment
        </Link>
      </div>

      <div className="flex flex-col rounded-xl border border-border bg-card p-5">
        <div className="flex size-9 items-center justify-center rounded-full bg-blush">
          <LogIn className="size-4 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
          Existing Patient
        </p>
        <p className="mt-1.5 grow text-sm text-muted-foreground">
          Already a patient? Log in to your FollowMyHealth account to self-schedule.
        </p>
        <Link
          href={portalHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={portalTrack}
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-primary transition-colors hover:bg-muted"
        >
          Log In to Book
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file**

```powershell
cd "c:\Users\reese\OneDrive\Documents\VSCode\Lux\lux-collective"
npx tsc --noEmit 2>&1 | Select-String "booking-cta"
```
Expected: no output (no errors referencing `booking-cta.tsx`)

- [ ] **Step 3: Commit**

```powershell
git add components/booking-cta.tsx
git commit -m "feat: add BookingCTA two-path component (new patient / existing patient)"
```

---

### Task 2: Update `lux-hero.tsx`

**Files:**
- Modify: `components/lux-hero.tsx`

Current state: imports `BookButton` on line 8; uses it on line 78 inside a `motion.div`; has a `{!bookingUrl && ...}` fallback paragraph on lines 88–96 that says "Online booking coming soon".

- [ ] **Step 1: Replace the import**

In `components/lux-hero.tsx`, replace line 8:
```tsx
import { BookButton } from "@/components/book-button";
```
With:
```tsx
import { BookingCTA } from "@/components/booking-cta";
```

- [ ] **Step 2: Replace the CTA block**

Replace the `motion.div` CTA block and the conditional fallback paragraph (lines 74–96):

**Remove this:**
```tsx
            <motion.div
              variants={item}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <BookButton bookingUrl={bookingUrl} source="home_hero" className="rounded-full" />
              <Link
                href="/services"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View services
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>

            {!bookingUrl && (
              <motion.p variants={item} className="mt-4 text-sm text-muted-foreground">
                Online booking coming soon —{" "}
                <a href={`tel:${business.phone.replace(/[^\d]/g, "")}`} className="underline underline-offset-2">
                  call us at {business.phone}
                </a>{" "}
                to schedule.
              </motion.p>
            )}
```

**Replace with:**
```tsx
            <motion.div variants={item} className="mt-8">
              <BookingCTA bookingUrl={bookingUrl} source="home_hero" />
              <Link
                href="/services"
                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View services
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
```

- [ ] **Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit 2>&1 | Select-String "lux-hero"
```
Expected: no output

- [ ] **Step 4: Commit**

```powershell
git add components/lux-hero.tsx
git commit -m "feat: replace BookButton with BookingCTA cards in hero, remove 'coming soon' copy"
```

---

### Task 3: Update `site-header.tsx`

**Files:**
- Modify: `components/site-header.tsx`

Current state: imports `BookButton` on line 6; uses it on lines 57–62 with a dynamic label `"Book now"` / `"Request booking"`.

- [ ] **Step 1: Replace the import**

In `components/site-header.tsx`, replace line 6:
```tsx
import { BookButton } from "@/components/book-button";
```
With:
```tsx
import { BookingCTA } from "@/components/booking-cta";
```

- [ ] **Step 2: Replace the button**

Replace lines 57–62:
```tsx
          <BookButton
            bookingUrl={bookingUrl}
            label={bookingUrl ? "Book now" : "Request booking"}
            source="header"
            className="rounded-full"
          />
```
With:
```tsx
          <BookingCTA
            bookingUrl={bookingUrl}
            source="header"
            variant="compact"
          />
```

- [ ] **Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit 2>&1 | Select-String "site-header"
```
Expected: no output

- [ ] **Step 4: Commit**

```powershell
git add components/site-header.tsx
git commit -m "feat: replace BookButton with compact BookingCTA in site header"
```

---

### Task 4: Update `services-pricing-section.tsx`

**Files:**
- Modify: `components/services-pricing-section.tsx`

Current state: imports `BookButton` on line 6; uses it in the category sidebar (line 109) with dark-background override classes; uses it in the service detail modal (line 265); has a `DetailRow` with stale copy implying a single booking link.

- [ ] **Step 1: Replace the import**

In `components/services-pricing-section.tsx`, replace line 6:
```tsx
import { BookButton } from "@/components/book-button";
```
With:
```tsx
import { BookingCTA } from "@/components/booking-cta";
```

- [ ] **Step 2: Replace the sidebar BookButton (lines 109–114)**

Remove:
```tsx
                <BookButton
                  bookingUrl={bookingUrl}
                  label={bookingUrl ? "Book" : "Ask"}
                  source={`services_${group.name.toLowerCase().replaceAll(" ", "_")}`}
                  className="mt-4 w-full !bg-primary-foreground !text-primary hover:!bg-primary-foreground/90"
                />
```
Replace with:
```tsx
                <BookingCTA
                  bookingUrl={bookingUrl}
                  source={`services_${group.name.toLowerCase().replaceAll(" ", "_")}`}
                  variant="stacked"
                  colorScheme="inverted"
                  className="mt-4"
                />
```

- [ ] **Step 3: Replace the modal BookButton (lines 265–269)**

Remove:
```tsx
            <BookButton
              bookingUrl={bookingUrl}
              label={bookingUrl ? "Book this service" : "Ask about this"}
              source={`service_modal_${selected.service.name.toLowerCase().replaceAll(" ", "_")}`}
              className="w-full"
            />
```
Replace with:
```tsx
            <BookingCTA
              bookingUrl={bookingUrl}
              source={`service_modal_${selected.service.name.toLowerCase().replaceAll(" ", "_")}`}
              variant="stacked"
            />
```

- [ ] **Step 4: Update the "Booking" DetailRow copy (lines 253–255)**

Remove:
```tsx
              <DetailRow
                label="Booking"
                value="Use the booking link when available, or send a general message for help choosing the right visit."
              />
```
Replace with:
```tsx
              <DetailRow
                label="How to Book"
                value="New patients can request an appointment through our contact form. Existing patients with a FollowMyHealth account can self-schedule directly from the portal."
              />
```

- [ ] **Step 5: Verify TypeScript**

```powershell
npx tsc --noEmit 2>&1 | Select-String "services-pricing"
```
Expected: no output

- [ ] **Step 6: Commit**

```powershell
git add components/services-pricing-section.tsx
git commit -m "feat: replace BookButton with BookingCTA in services section and modal, update booking detail copy"
```

---

### Task 5: Update `about/page.tsx`

**Files:**
- Modify: `app/(public)/about/page.tsx`

Current state: imports `BookButton` on line 5; uses it on line 80 inside a flex CTA row alongside a "View services" link.

- [ ] **Step 1: Replace the import**

In `app/(public)/about/page.tsx`, replace line 5:
```tsx
import { BookButton } from "@/components/book-button";
```
With:
```tsx
import { BookingCTA } from "@/components/booking-cta";
```

- [ ] **Step 2: Replace the CTA block (lines 79–87)**

Remove:
```tsx
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BookButton bookingUrl={bookingUrl} source="about" className="rounded-full" />
              <a
                href="/services"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View services
              </a>
            </div>
```
Replace with:
```tsx
            <div className="mt-8">
              <BookingCTA bookingUrl={bookingUrl} source="about" />
              <a
                href="/services"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View services
              </a>
            </div>
```

- [ ] **Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit 2>&1 | Select-String "about"
```
Expected: no output

- [ ] **Step 4: Commit**

```powershell
git add "app/(public)/about/page.tsx"
git commit -m "feat: replace BookButton with BookingCTA cards on About page"
```

---

### Task 6: Delete `book-button.tsx`

**Files:**
- Delete: `components/book-button.tsx`

- [ ] **Step 1: Confirm no remaining imports**

```powershell
Get-ChildItem -Recurse -Include "*.tsx","*.ts" "c:\Users\reese\OneDrive\Documents\VSCode\Lux\lux-collective" |
  Select-String -Pattern "book-button|BookButton" |
  Where-Object { $_.Path -notlike "*book-button.tsx" }
```
Expected: no output

- [ ] **Step 2: Delete the file**

```powershell
Remove-Item "c:\Users\reese\OneDrive\Documents\VSCode\Lux\lux-collective\components\book-button.tsx"
```

- [ ] **Step 3: Verify TypeScript still passes**

```powershell
npx tsc --noEmit
```
Expected: exits with code 0, no error output

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "chore: remove BookButton component (fully replaced by BookingCTA)"
```

---

### Task 7: Create `HowBookingWorks` component

**Files:**
- Create: `components/how-booking-works.tsx`

- [ ] **Step 1: Write the component**

Create `components/how-booking-works.tsx` with this exact content:

```tsx
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Submit a Request",
    body: "Fill out our quick contact form with your name, preferred service, and a few available times.",
  },
  {
    number: "2",
    title: "We'll Confirm",
    body: "A member of our team will reach out within 24 hours to confirm your appointment details.",
  },
  {
    number: "3",
    title: "You're All Set",
    body: "You'll receive a confirmation and can manage future appointments through your FollowMyHealth patient portal.",
  },
];

export function HowBookingWorks({ bookingUrl }: { bookingUrl: string | null }) {
  const portalHref = bookingUrl ?? "/contact";
  const isExternal = Boolean(bookingUrl);

  return (
    <section
      aria-labelledby="how-booking-heading"
      className="border-y border-border bg-card"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <h2
          id="how-booking-heading"
          className="text-center text-3xl text-primary sm:text-4xl"
        >
          How Booking Works
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush">
                <span className="text-base font-bold text-accent">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-4 text-xl text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Already a patient with a FollowMyHealth account?{" "}
          <Link
            href={portalHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            self-schedule directly from the portal
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```powershell
npx tsc --noEmit 2>&1 | Select-String "how-booking"
```
Expected: no output

- [ ] **Step 3: Commit**

```powershell
git add components/how-booking-works.tsx
git commit -m "feat: add HowBookingWorks step-flow section component"
```

---

### Task 8: Add `HowBookingWorks` to the Services page

**Files:**
- Modify: `app/(public)/services/page.tsx`

- [ ] **Step 1: Add the import**

In `app/(public)/services/page.tsx`, add this import after line 4 (after the `ServiceSlideshow` import):
```tsx
import { HowBookingWorks } from "@/components/how-booking-works";
```

- [ ] **Step 2: Insert the section**

In the `return` block, insert `<HowBookingWorks bookingUrl={bookingUrl} />` between the closing `</section>` of the gradient hero (line ~97) and the `{/* Service category slideshow */}` div. The resulting page structure:

```tsx
  return (
    <>
      {/* Gradient hero */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-[linear-gradient(145deg,var(--cream),var(--blush))]">
        {/* ... existing hero content unchanged ... */}
      </section>

      {/* How booking works */}
      <HowBookingWorks bookingUrl={bookingUrl} />

      {/* Service category slideshow */}
      <div className="mx-auto max-w-7xl">
        <ServiceSlideshow />
      </div>

      {/* Service groups */}
      <PublicServicesPricing bookingUrl={bookingUrl} initialServiceGroups={serviceGroups} />
    </>
  );
```

- [ ] **Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit 2>&1 | Select-String "services"
```
Expected: no output

- [ ] **Step 4: Commit**

```powershell
git add "app/(public)/services/page.tsx"
git commit -m "feat: add HowBookingWorks explainer section to Services page"
```

---

### Task 9: Final verification

- [ ] **Step 1: Full type check**

```powershell
npx tsc --noEmit
```
Expected: exits cleanly, no errors

- [ ] **Step 2: Lint**

```powershell
npx next lint
```
Expected: `✓ No ESLint warnings or errors`

- [ ] **Step 3: Build**

```powershell
npx next build
```
Expected: build completes successfully (no type or compile errors)

- [ ] **Step 4: Confirm no `BookButton` references remain**

```powershell
Get-ChildItem -Recurse -Include "*.tsx","*.ts" "c:\Users\reese\OneDrive\Documents\VSCode\Lux\lux-collective" |
  Select-String -Pattern "book-button|BookButton"
```
Expected: no output

- [ ] **Step 5: Confirm old booking copy is gone**

```powershell
Get-ChildItem -Recurse -Include "*.tsx" "c:\Users\reese\OneDrive\Documents\VSCode\Lux\lux-collective\app","c:\Users\reese\OneDrive\Documents\VSCode\Lux\lux-collective\components" |
  Select-String -Pattern "Book now|Book an Appointment|Schedule online|booking coming soon|Book your|book instantly"
```
Expected: no output (none of these phrases should remain in component or page files)

- [ ] **Step 6: Commit if any last-minute fixes were needed**

```powershell
git add -A
git commit -m "chore: final cleanup after booking flow update"
```

---

## Completion Notes

**Pages/components changed beyond the spec's explicit list:**
- `components/lux-hero.tsx` — also removed "Online booking coming soon — call us at…" fallback copy (implied by Task 2 requirement to remove frictionless-booking language)
- `components/services-pricing-section.tsx` — updated the "Booking" DetailRow label to "How to Book" and rewrote its value to describe the two-path process

**Pages deliberately left unchanged:**
- `app/(public)/contact/page.tsx` — spec explicitly excludes it
- `content/site.ts` — contains only business info and service data; no booking copy
- `app/(public)/gallery/page.tsx`, `newsletter/page.tsx`, `unsubscribed/page.tsx` — no booking copy
- Admin pages — no public-facing booking CTAs

**Analytics event destinations added:**
- `contact_new_patient` — new patient clicks "Request an Appointment" → `/contact`
- `fmh_portal` — existing patient clicks "Log In to Book" → external FMH URL
- `contact_fallback` — existing patient clicks "Log In to Book" but `NEXT_PUBLIC_BOOKING_URL` is unset → falls back to `/contact`
