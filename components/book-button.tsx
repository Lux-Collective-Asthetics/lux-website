"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type BookButtonProps = {
  bookingUrl: string | null;
  label?: string;
  className?: string;
  source: string;
};

export function BookButton({
  bookingUrl,
  label = "Book a consultation",
  className,
  source,
}: BookButtonProps) {
  const href = bookingUrl ?? "/contact";
  const isExternal = Boolean(bookingUrl);

  return (
    <Button asChild size="lg" className={className}>
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={() =>
          track("book_click", {
            source,
            destination: isExternal ? "external_booking" : "contact_fallback",
          })
        }
      >
        <CalendarDays data-icon="inline-start" />
        {label}
      </Link>
    </Button>
  );
}
