"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart2,
  Images,
  MessageSquare,
  Scissors,
  Users,
  Mail,
  Send,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ExternalLink,
  BookImage,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      {
        label: "Analytics",
        href: process.env.NEXT_PUBLIC_PLAUSIBLE_URL ?? "https://plausible.io",
        icon: BarChart2,
        external: true,
      },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Gallery", href: "/admin/gallery", icon: Images },
      { label: "About Gallery", href: "/admin/about-gallery", icon: BookImage },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
      { label: "Services", href: "/admin/services", icon: Scissors },
      { label: "Staff", href: "/admin/staff", icon: Users },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
      { label: "Newsletters", href: "/admin/newsletters", icon: Send },
    ],
  },
];

type AdminSidebarProps = {
  user: { email: string | undefined };
  onSignOut: () => Promise<void>;
};

function isActive(pathname: string, href: string, external?: boolean) {
  if (external) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar({ user, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div
        className={cn(
          "flex items-center border-b border-border py-4",
          collapsed ? "justify-center px-4" : "gap-3 px-5"
        )}
      >
        {/* Gold circle logomark */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-admin-gold">
          <span className="text-sm font-bold text-white">L</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Lux Collective</p>
            <p className="truncate text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Desktop collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "hidden lg:flex items-center justify-center self-end mx-3 mt-3 size-7 rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          collapsed && "self-center mx-auto"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* Nav sections — scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href, item.external);
                const navItemClass = cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center",
                  active
                    ? "bg-[#fdf5e8] text-admin-gold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                );

                return (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={navItemClass}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className="size-5 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            <ExternalLink className="ml-auto size-3 opacity-40" />
                          </>
                        )}
                      </a>
                    ) : (
                      <Link href={item.href} className={navItemClass} onClick={() => setMobileOpen(false)}>
                        <item.icon className="size-5 shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile card + sign out */}
      <div className="shrink-0 border-t border-border px-3 py-3 space-y-1">
        {/* Profile row */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2",
            collapsed && "justify-center"
          )}
        >
          {/* Online dot indicator */}
          <div className="relative shrink-0">
            <div className="size-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                {user.email?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-1 ring-card" />
          </div>
          {!collapsed && (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>

        {/* Sign out button */}
        <button
          onClick={onSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
            collapsed && "justify-center"
          )}
          aria-label="Sign out"
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span className="truncate">Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger trigger — visible only on small screens */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar — slides in from left */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close navigation"
        >
          <X className="size-3.5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border shrink-0 transition-all duration-200 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ minHeight: "100vh" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
