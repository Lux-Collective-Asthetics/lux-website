import type { Metadata } from "next";

import { HomepageTestimonials } from "@/components/homepage-testimonials";
import { HomepageProviders } from "@/components/homepage-providers";
import { LuxHero } from "@/components/lux-hero";
import { RevealSection } from "@/components/shared/reveal-section";
import { LuxFeaturesScroll } from "@/components/ui/text-parallax-scroll";
import { business, staff as staticStaff, testimonials as staticTestimonials } from "@/content/site";
import type { Testimonial } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory, StaffMember } from "@/lib/types/db";

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
  let homepageTestimonials: Testimonial[] = [];
  let homepageStaff: StaffMember[] = [];
  let serviceCategories: ServiceCategory[] = [];
  let shouldUseFallback = false;

  try {
    const supabase = await createClient();
    const [testimonialsRes, staffRes, categoriesRes] = await Promise.all([
      supabase
        .from("testimonials")
        .select("quote, author")
        .eq("is_visible", true)
        .order("display_order"),
      supabase
        .from("staff_members")
        .select("*")
        .eq("is_visible", true)
        .order("display_order"),
      supabase
        .from("service_categories")
        .select("*")
        .order("display_order"),
    ]);

    if (testimonialsRes.error) {
      shouldUseFallback = true;
    } else if (testimonialsRes.data) {
      homepageTestimonials = testimonialsRes.data.map((t: { quote: string; author: string }) => ({
        quote: t.quote,
        author: t.author,
      }));
    }

    if (!staffRes.error) {
      homepageStaff = (staffRes.data ?? []) as StaffMember[];
    }

    if (!categoriesRes.error) {
      serviceCategories = (categoriesRes.data ?? []) as ServiceCategory[];
    }
  } catch {
    shouldUseFallback = true;
  }

  if (shouldUseFallback && homepageTestimonials.length === 0) {
    homepageTestimonials = staticTestimonials;
  }

  if (homepageStaff.length === 0) {
    homepageStaff = staticStaff.map((member, index) => ({
      id: `static-${index}`,
      name: member.name,
      credential: member.credential,
      title: member.title,
      bio: member.bio,
      photo_url: member.photo ?? null,
      booking_url: null,
      display_order: index,
      is_visible: true,
      is_owner: member.isOwner ?? false,
      created_at: new Date().toISOString(),
    }));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <LuxHero />

      {/* Signature services */}
      <LuxFeaturesScroll initialCategories={serviceCategories} />

      {/* Our providers */}
      <HomepageProviders initialStaff={homepageStaff} />

      {/* Testimonials */}
      <RevealSection>
        <HomepageTestimonials initialTestimonials={homepageTestimonials} />
      </RevealSection>
    </>
  );
}
