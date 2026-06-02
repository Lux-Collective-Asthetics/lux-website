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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fire once on mount — bookingUrl comes from env and never changes at runtime

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
          className={cn(
            "mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
            inv
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
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
          className={cn(
            "mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
            inv
              ? "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              : "border border-border text-primary hover:bg-muted",
          )}
        >
          Log In to Book
        </Link>
      </div>
    </div>
  );
}
