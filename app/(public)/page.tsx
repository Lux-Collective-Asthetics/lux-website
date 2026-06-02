import type { Metadata } from "next";

import { HomepageTestimonials } from "@/components/homepage-testimonials";
import { LuxHero } from "@/components/lux-hero";
import { RevealSection } from "@/components/shared/reveal-section";
import { LuxFeaturesScroll } from "@/components/ui/text-parallax-scroll";
import { business } from "@/content/site";
import type { Testimonial } from "@/content/site";
import { getBookingUrl } from "@/lib/booking";
import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const bookingUrl = getBookingUrl();
  let homepageTestimonials: Testimonial[] = [];

  try {
    const supabase = await createClient();
    const { data: dbTestimonials, error } = await supabase
      .from("testimonials")
      .select("quote, author")
      .eq("is_visible", true)
      .order("display_order");

    if (!error && dbTestimonials) {
      homepageTestimonials = dbTestimonials.map((testimonial: { quote: string; author: string }) => ({
        quote: testimonial.quote,
        author: testimonial.author,
      }));
    }
  } catch {
    homepageTestimonials = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <LuxHero bookingUrl={bookingUrl} />

      {/* Signature services */}
      <LuxFeaturesScroll />

      {/* Testimonials */}
      <RevealSection>
        <HomepageTestimonials initialTestimonials={homepageTestimonials} />
      </RevealSection>
    </>
  );
}
