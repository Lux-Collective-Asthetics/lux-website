"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StaffMemberWithServices, StaffPhoto } from "@/lib/types/db";
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

export function PublicStaffSection({
  initialStaff,
}: {
  initialStaff: StaffMemberWithServices[];
}) {
  const { data: staff } = usePublicStaff(initialStaff);
  const [selected, setSelected] = useState<StaffMemberWithServices | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Reset photo state eagerly in the handler to avoid stale photos flashing
  function handleSelect(member: StaffMemberWithServices | null) {
    if (member?.id !== selected?.id) {
      setPhotos([]);
      setPhotoIndex(0);
      setLoadingPhotos(member !== null);
    }
    setSelected(member);
  }

  // Fetch photos when selected member changes — capture primitives so TS doesn't
  // complain about `selected` being possibly null inside the async closure
  useEffect(() => {
    const member = selected;
    if (!member) return;
    const staffId = member.id;
    const mainPhotoUrl = member.photo_url;
    let cancelled = false;
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("staff_photos")
          .select("photo_url")
          .eq("staff_id", staffId)
          .order("display_order");
        if (cancelled) return;
        const extra = ((data ?? []) as Pick<StaffPhoto, "photo_url">[]).map(
          (p) => p.photo_url
        );
        const all = mainPhotoUrl ? [mainPhotoUrl, ...extra] : extra;
        setPhotos(all);
        setPhotoIndex(0);
      } finally {
        if (!cancelled) setLoadingPhotos(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.photo_url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selected || !detailRef.current) return;
    detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

  const prev = useCallback(
    () => setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1)),
    [photos.length]
  );
  const next = useCallback(
    () => setPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1)),
    [photos.length]
  );

  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, prev, next]);

  if (staff.length === 0) return null;

  const hasSelection = selected !== null;

  return (
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
            const isSelected = selected?.id === member.id;
            const isMini = hasSelection && !isSelected;
            const namedServices = member.staff_services.filter(
              (ss) => ss.services?.name
            );
            const visibleServices = namedServices.slice(0, 3);
            const extraCount = namedServices.length - visibleServices.length;

            return (
              <article
                key={member.id}
                className={[
                  "group relative overflow-hidden rounded-xl border",
                  "transition-[opacity,border-color] duration-300",
                  isOwner ? "sm:col-span-2" : "",
                  isSelected
                    ? "border-champagne/50 ring-1 ring-champagne/25"
                    : "border-primary-foreground/10",
                  isMini ? "opacity-35" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
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

                  <div className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/50 to-transparent" />

                  {isOwner && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-champagne/40 bg-champagne/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-champagne">
                      <span aria-hidden="true">✦</span> Owner
                    </div>
                  )}

                  {/* Invisible full-card button — placed before info overlay so info sits above it */}
                  <button
                    type="button"
                    onClick={() => handleSelect(isSelected ? null : member)}
                    aria-label={`View ${member.name}'s profile`}
                    className="absolute inset-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-inset"
                  />

                  {/* Info overlay — pointer-events-none so clicks fall through to the button above,
                      except on the booking link which re-enables pointer events */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-4">
                    <h3
                      className={[
                        "font-heading font-bold leading-tight text-primary-foreground",
                        isOwner ? "text-xl" : "text-base",
                      ].join(" ")}
                    >
                      {member.name}
                      {member.credential ? `, ${member.credential}` : ""}
                    </h3>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-foreground/50">
                      {member.title}
                    </p>

                    {visibleServices.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {visibleServices.map((ss) => (
                          <span
                            key={ss.service_id}
                            className="rounded-full border border-champagne/25 bg-champagne/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-champagne"
                          >
                            {ss.services!.name}
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
                          className="pointer-events-auto rounded-full bg-champagne px-3 py-1.5 text-[10px] font-bold text-espresso transition-opacity hover:opacity-90"
                        >
                          Book with {member.name.split(" ")[0]}
                        </a>
                      )}
                      <span className="text-[10px] font-semibold text-primary-foreground/55 underline underline-offset-2 decoration-primary-foreground/30">
                        {isSelected ? "viewing below ↓" : "view profile"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Inline detail panel */}
        {selected && (
          <div
            ref={detailRef}
            className="mt-6 overflow-hidden rounded-xl border border-champagne/30 bg-white/5"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Photo carousel */}
              <div className="relative w-full shrink-0 bg-black sm:w-2/5">
                <div className="relative aspect-square w-full sm:aspect-3/4">
                  {loadingPhotos ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    </div>
                  ) : photos[photoIndex] ? (
                    <Image
                      src={photos[photoIndex]}
                      alt={`${selected.name} photo ${photoIndex + 1}`}
                      fill
                      sizes="(min-width: 640px) 40vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-heading text-4xl font-semibold text-white/30">
                      {staffInitials(selected.name)}
                    </div>
                  )}

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {photos.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPhotoIndex(idx)}
                            aria-label={`Go to photo ${idx + 1}`}
                            className={`size-2 rounded-full transition-all ${
                              idx === photoIndex
                                ? "scale-125 bg-white"
                                : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info panel */}
              <div className="relative flex flex-1 flex-col justify-between overflow-y-auto p-6">
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  aria-label="Close profile"
                  autoFocus
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <X className="size-4" />
                </button>

                <div>
                  <h2 className="pr-10 font-heading text-2xl font-bold text-primary-foreground">
                    {selected.name}
                    {selected.credential ? `, ${selected.credential}` : ""}
                  </h2>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground/50">
                    {selected.title}
                  </p>

                  {selected.is_owner && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-champagne/35 bg-champagne/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-champagne">
                      <span aria-hidden="true">✦</span> Owner &amp; Founder
                    </div>
                  )}

                  {selected.bio && (
                    <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
                      {selected.bio}
                    </p>
                  )}

                  {selected.staff_services.filter((ss) => ss.services?.name)
                    .length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/40">
                        Services offered
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.staff_services
                          .filter((ss) => ss.services?.name)
                          .map((ss) => (
                            <span
                              key={ss.service_id}
                              className="rounded-full border border-champagne/25 bg-champagne/10 px-2.5 py-1 text-[10px] font-semibold text-champagne"
                            >
                              {ss.services!.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {selected.booking_url && (
                  <a
                    href={selected.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-champagne px-5 py-3 text-sm font-bold text-espresso transition-opacity hover:opacity-90"
                  >
                    Book with {selected.name.split(" ")[0]} →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
