"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { StaffMemberWithServices } from "@/lib/types/db";
import { usePublicStaff } from "@/lib/public-content-hooks";

function staffInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function HomepageProviders({ initialStaff }: { initialStaff: StaffMemberWithServices[] }) {
  const { data: staff } = usePublicStaff(initialStaff);

  if (staff.length === 0) return null;

  return (
    <section className="border-y border-border bg-card" aria-labelledby="providers-heading">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              The team
            </p>
            <h2 id="providers-heading" className="mt-3 text-4xl text-primary">
              The people behind every result.
            </h2>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Meet the full team
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((member, i) => (
            <div
              key={member.id}
              className="flex flex-col items-center rounded-lg border border-border bg-background p-5 text-center"
            >
              <div className="relative mb-4 flex size-20 items-center justify-center overflow-hidden rounded-xl bg-muted text-sm font-semibold tracking-wide text-muted-foreground">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    priority={i === 0}
                  />
                ) : (
                  staffInitials(member.name)
                )}
              </div>
              <p className="font-semibold text-foreground">
                {member.name}
                {member.credential ? `, ${member.credential}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{member.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
