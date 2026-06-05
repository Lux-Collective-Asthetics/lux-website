import type { Metadata } from "next";
import { ShieldCheck, Sparkles } from "lucide-react";

import { PublicStaffSection } from "@/components/public-staff-section";
import { AboutGallery } from "@/components/AboutGallery";
import { business, brandPrinciples, staff as defaultStaff } from "@/content/site";
import { createClient } from "@/lib/supabase/server";
import type { AboutGalleryPhoto, StaffMember } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about The Lux Collective Aesthetics & Wellness, a science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
  openGraph: {
    title: "About | The Lux Collective",
    description: "A science-led med spa in Newark, Ohio focused on natural-looking results and personalized care.",
    url: "https://theluxcollectiveaesthetics.com/about",
  },
};

export default async function AboutPage() {
  const supabase = await createClient();

  let staff: StaffMember[] = [];
  let galleryPhotos: AboutGalleryPhoto[] = [];

  try {
    const [staffRes, galleryRes] = await Promise.all([
      supabase.from("staff_members").select("*").eq("is_visible", true).order("display_order"),
      supabase.from("about_gallery").select("*").eq("is_visible", true).order("display_order"),
    ]);

    if (!staffRes.error) {
      staff = (staffRes.data ?? []) as StaffMember[];
    }
    if (!galleryRes.error) {
      galleryPhotos = (galleryRes.data ?? []) as AboutGalleryPhoto[];
    }
  } catch {
    // fall through to static fallback below
  }

  if (staff.length === 0) {
    staff = defaultStaff.map((member, index) => ({
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
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <Sparkles className="size-4 text-accent" />
            Welcome to The Lux
          </p>
          <h1 className="mt-4 text-5xl text-primary sm:text-6xl">
            Advanced aesthetics with a provider-first, human approach.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {business.shortName} is built for clients who want science-backed treatments, clear guidance, and an experience that feels calm from the first conversation.
          </p>
          <div className="mt-8">
            <a
              href="/services"
              className="inline-flex h-9 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
            >
              View services
            </a>
          </div>
        </div>
      </section>

      <AboutGallery initialPhotos={galleryPhotos} />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Our standard
            </p>
            <h2 className="mt-3 text-4xl text-primary">
              Built around trust before treatment.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {brandPrinciples.map((principle) => (
              <div key={principle} className="rounded-lg border border-border bg-card p-5">
                <ShieldCheck className="size-5 text-accent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicStaffSection initialStaff={staff} />
    </div>
  );
}
