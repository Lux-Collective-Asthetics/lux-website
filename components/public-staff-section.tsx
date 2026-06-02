"use client";

import Image from "next/image";

import type { StaffMember } from "@/lib/types/db";
import { usePublicStaff } from "@/lib/public-content-hooks";

function staffInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PublicStaffSection({ initialStaff }: { initialStaff: StaffMember[] }) {
  const { data: staff } = usePublicStaff(initialStaff);

  if (staff.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
          Meet the team
        </p>
        <h2 className="mt-3 max-w-xl text-4xl">
          The people behind every treatment.
        </h2>

        <div className="mt-8 flex flex-col gap-4">
          {staff.map((member) => (
            <article
              key={member.id}
              className="flex gap-5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 p-5"
            >
              <div className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-foreground/10 text-sm font-semibold tracking-wide text-champagne">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  staffInitials(member.name)
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-primary-foreground">
                    {member.name}, {member.credential}
                  </h3>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                  {member.title}
                </p>
                <p className="mt-3 text-sm text-primary-foreground/70">{member.bio}</p>
                {member.booking_url && (
                  <a
                    href={member.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center rounded-full border border-champagne/30 bg-champagne/10 px-4 py-1.5 text-xs font-medium text-champagne transition-colors hover:bg-champagne/20"
                  >
                    Book with {member.name.split(" ")[0]}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
