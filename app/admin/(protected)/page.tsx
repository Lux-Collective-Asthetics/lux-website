import Link from "next/link";
import { Images, MessageSquare, Users, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: galleryCount },
    { count: testimonialCount },
    { count: subscriberCount },
    { data: lastNewsletter },
  ] = await Promise.all([
    supabase.from("gallery_images").select("*", { count: "exact", head: true }).eq("is_visible", true),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("is_visible", true),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_sends").select("campaign_name").order("created_at", { ascending: false }).limit(1),
  ]);

  const stats = [
    {
      label: "Gallery Images",
      value: galleryCount ?? "—",
      icon: Images,
      href: "/admin/gallery",
    },
    {
      label: "Testimonials",
      value: testimonialCount ?? "—",
      icon: MessageSquare,
      href: "/admin/testimonials",
    },
    {
      label: "Subscribers",
      value: subscriberCount ?? "—",
      icon: Users,
      href: "/admin/subscribers",
    },
    {
      label: "Last Campaign",
      value: lastNewsletter?.[0]?.campaign_name ?? "None yet",
      icon: Send,
      href: "/admin/newsletters",
      small: true,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl text-primary">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the Lux Collective admin area.
      </p>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf5e8]">
              <stat.icon className="size-5 text-[#c9a96e]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className={stat.small ? "mt-1 truncate text-sm font-semibold text-primary" : "mt-1 text-2xl font-semibold text-primary"}>
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Nav cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/subscribers"
          className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/40"
        >
          <p className="text-sm font-semibold text-primary">Newsletter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage subscribers.
          </p>
        </Link>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary">Blog</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Write and publish posts. Coming soon.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary">Contact Inbox</p>
          <p className="mt-1 text-sm text-muted-foreground">
            View contact form submissions. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
