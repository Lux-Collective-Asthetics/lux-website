"use client";

import { useState } from "react";
import Image from "next/image";

import type { StaffMemberWithServices } from "@/lib/types/db";
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

export function PublicStaffSection({ initialStaff }: { initialStaff: StaffMemberWithServices[] }) {
  const { data: staff } = usePublicStaff(initialStaff);
  const [selected, setSelected] = useState<StaffMemberWithServices | null>(null);

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

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((member, i) => {
              const isOwner = member.is_owner;
              const serviceNames = member.staff_services
                .map((ss) => ss.services?.name)
                .filter(Boolean) as string[];
              const visibleServices = serviceNames.slice(0, 3);
              const extraCount = serviceNames.length - visibleServices.length;

              return (
                <article
                  key={member.id}
                  className={[
                    "group relative overflow-hidden rounded-xl border border-primary-foreground/10 transition-colors hover:border-champagne/40",
                    isOwner ? "col-span-2" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Photo container with gradient overlay */}
                  <div
                    className={[
                      "relative w-full bg-primary-foreground/10",
                      isOwner ? "aspect-3/4" : "aspect-2/3",
                    ].join(" ")}
                  >
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        sizes={
                          isOwner
                            ? "(min-width: 640px) 50vw, 100vw"
                            : "(min-width: 640px) 25vw, 50vw"
                        }
                        className="object-cover"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-heading text-3xl font-semibold text-champagne/30">
                        {staffInitials(member.name)}
                      </div>
                    )}

                    {/* Cinematic gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/50 to-transparent" />

                    {/* Owner badge */}
                    {isOwner && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-champagne/40 bg-champagne/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-champagne">
                        <span aria-hidden="true">✦</span> Owner
                      </div>
                    )}

                    {/* Overlaid info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3
                        className={[
                          "font-heading font-bold leading-tight text-primary-foreground",
                          isOwner ? "text-xl" : "text-base",
                        ].join(" ")}
                      >
                        {member.name}, {member.credential}
                      </h3>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-foreground/50">
                        {member.title}
                      </p>

                      {visibleServices.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {visibleServices.map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-champagne/25 bg-champagne/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-champagne"
                            >
                              {name}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="rounded-full border border-champagne/25 bg-champagne/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-champagne">
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {member.booking_url && (
                          <a
                            href={member.booking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-champagne px-3 py-1.5 text-[10px] font-bold text-espresso transition-opacity hover:opacity-90"
                          >
                            Book with {member.name.split(" ")[0]}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelected(member)}
                          className="border-b border-primary-foreground/30 text-[10px] font-semibold text-primary-foreground/55 transition-colors hover:text-primary-foreground/80"
                        >
                          View profile
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {selected && (
        <StaffModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
