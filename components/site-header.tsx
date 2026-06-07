"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NewsletterDialogTrigger } from "@/components/newsletter-dialog-trigger";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
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
            <li>
              <NewsletterDialogTrigger showIcon className="inline-flex items-center gap-1" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
