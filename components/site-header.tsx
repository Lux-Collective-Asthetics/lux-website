import Link from "next/link";

import { BookButton } from "@/components/book-button";
import { getBookingUrl } from "@/lib/booking";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/newsletter", label: "Newsletter" },
];

export function SiteHeader() {
  const bookingUrl = getBookingUrl();

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
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link className="transition-colors hover:text-foreground" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton
            bookingUrl={bookingUrl}
            label={bookingUrl ? "Book now" : "Request booking"}
            source="header"
          />
        </div>
      </div>
    </header>
  );
}
