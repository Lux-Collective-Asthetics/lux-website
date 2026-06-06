"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StaffMemberWithServices, StaffPhoto } from "@/lib/types/db";

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

type Props = {
  member: StaffMemberWithServices;
  onClose: () => void;
};

export function StaffModal({ member, onClose }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("staff_photos")
        .select("photo_url")
        .eq("staff_id", member.id)
        .order("display_order");

      if (cancelled) return;

      const extra = ((data ?? []) as Pick<StaffPhoto, "photo_url">[]).map(
        (p) => p.photo_url
      );
      const all = member.photo_url ? [member.photo_url, ...extra] : extra;
      setPhotos(all);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [member.id, member.photo_url]);

  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1)),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1)),
    [photos.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const serviceNames = member.staff_services
    .map((ss) => ss.services?.name)
    .filter(Boolean) as string[];

  const currentPhoto = photos[index];
  const hasMultiple = photos.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Profile of ${member.name}`}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="size-4" />
        </button>

        {/* Photo carousel — top on mobile, left on sm+ */}
        <div className="relative w-full bg-black sm:w-1/2 sm:shrink-0">
          <div className="relative aspect-square w-full sm:aspect-3/4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            ) : currentPhoto ? (
              <Image
                src={currentPhoto}
                alt={`${member.name} photo ${index + 1}`}
                fill
                sizes="(min-width: 640px) 384px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-heading text-4xl font-semibold text-white/30">
                {staffInitials(member.name)}
              </div>
            )}

            {hasMultiple && (
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
              </>
            )}

            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`size-2 rounded-full transition-all ${
                      i === index ? "scale-125 bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info panel — bottom on mobile, right on sm+ */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              {member.name}, {member.credential}
            </h2>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {member.title}
            </p>

            {member.is_owner && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-champagne/35 bg-champagne/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-champagne">
                <span aria-hidden="true">✦</span> Owner &amp; Founder
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>

            {serviceNames.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Services offered
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {serviceNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {member.booking_url && (
            <a
              href={member.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-champagne px-5 py-3 text-sm font-bold text-espresso transition-opacity hover:opacity-90"
            >
              Book with {member.name.split(" ")[0]} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
