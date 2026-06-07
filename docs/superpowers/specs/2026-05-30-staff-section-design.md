# Staff Section — About Page

## Summary

Replace the placeholder "Specialized people" section on the About page with a real "Meet the Team" section featuring the four Lux Collective staff members. Layout is a horizontal list (one row per person) on a dark background, matching the existing site aesthetic. Staff photos use initials-based placeholders until real headshots are provided.

## Staff Data

Four members, added to `content/site.ts` as a typed `staff` array:

| Name | Credential | Title | Co-owner |
|---|---|---|---|
| Megan Evans | CNP | Certified Nurse Practitioner | Yes |
| Ashley Robinson | APRN | Advanced Practice Registered Nurse | Yes |
| Rachel Kunkler | AE | Advanced Esthetician | No |
| Morgan Frost | LMT | Licensed Massage Therapist | No |

Bios (1–2 sentences each, warm and welcoming):
- **Megan Evans** — Megan brings a clinical eye and a warm, approachable style to every consultation — helping clients feel confident in their care from the very first visit.
- **Ashley Robinson** — Ashley's approach is rooted in safety, precision, and genuine connection — she believes every client deserves a provider who listens before treating.
- **Rachel Kunkler** — Rachel's deep knowledge of skin health means every treatment is thoughtful, precise, and tailored to what your skin actually needs.
- **Morgan Frost** — Morgan creates a space where clients feel genuinely cared for — her sessions are calm, attentive, and designed around your comfort and wellness goals.

The `StaffMember` type includes an optional `photo` field (image path) so real headshots can be wired in later without changing the component structure.

## Layout

- Dark section (`bg-primary text-primary-foreground`) — same palette as the existing dark section it replaces
- Eyebrow: "Meet the team"
- Heading: "The people behind every treatment."
- Each row: `[photo placeholder] [name + credential badge + title + bio]`
- Co-owners get a small "Co-owner" badge next to their name
- Photo placeholder: fixed `w-16 h-20` rounded div showing initials in accent gold, on a dark gradient background. No dependency on the existing `PhotoPlaceholder` component (which is sized for full-width images, not portrait thumbnails). When real photos are added, swap the div for a `next/image` using the `photo` field.

## Files Changed

1. **`content/site.ts`** — add `StaffMember` type and `staff` array
2. **`app/(public)/about/page.tsx`** — replace the `specialists` array and its render section with the new team section using `staff` data

No new files or components needed.

## Out of Scope

- Booking integration (Practice Fusion URL config — separate task)
- Real staff photos (drop-in later via the `photo` field)
