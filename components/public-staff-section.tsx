"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";

import type { StaffMember } from "@/lib/types/db";
import { usePublicStaff } from "@/lib/public-content-hooks";
import { StaffModal } from "@/components/StaffModal";

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

export function PublicStaffSection({ initialStaff }: { initialStaff: StaffMember[] }) {
  const { data: staff } = usePublicStaff(initialStaff);
  const [selected, setSelected] = useState<StaffMember | null>(null);

  if (staff.length === 0) return null;

  return (
    <>
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
                    {member.is_owner && (
                      <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-champagne">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                    {member.title}
                  </p>
                  <p className="mt-3 text-sm text-primary-foreground/70">{member.bio}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {member.booking_url && (
                      <a
                        href={member.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-champagne/30 bg-champagne/10 px-4 py-1.5 text-xs font-medium text-champagne transition-colors hover:bg-champagne/20"
                      >
                        Book with {member.name.split(" ")[0]}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(member)}
                      className="flex items-center gap-1.5 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs font-medium text-primary-foreground/60 transition-colors hover:border-primary-foreground/40 hover:text-primary-foreground/80"
                    >
                      <Images className="size-3" /> View photos
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <StaffModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
