import Link from "next/link";

import { NewsletterDialogTrigger } from "@/components/newsletter-dialog-trigger";
import { business } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-heading text-2xl">{business.shortName}</p>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/75">
            {business.address.street}, {business.address.city}, {business.address.state}{" "}
            {business.address.zip}
          </p>
          <p className="mt-2 text-sm text-primary-foreground/75">
            <a href={`tel:${business.phone.replaceAll(/[^\d]/g, "")}`}>{business.phone}</a>
          </p>
          <p className="mt-1 text-sm text-primary-foreground/75">
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Hours</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
            {business.hours.map((hour) => (
              <li key={hour}>{hour}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
            <li><Link href="/services" className="hover:text-primary-foreground transition-colors">Services &amp; Pricing</Link></li>
            <li><Link href="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
            <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
            <li>
              <NewsletterDialogTrigger className="text-left hover:text-primary-foreground" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-5 py-4 text-center text-xs text-primary-foreground/65">
        &copy; {new Date().getFullYear()} {business.name}. General inquiries only — do not send medical information through this website.
      </div>
    </footer>
  );
}
