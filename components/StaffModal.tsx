"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StaffMember, StaffPhoto } from "@/lib/types/db";

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
  member: StaffMember;
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
      const all = member.photo_url
        ? [member.photo_url, ...extra]
        : extra;
      setPhotos(all);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [member.id, member.photo_url]);

  const prev = useCallback(() =>
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1)), [photos.length]);
  const next = useCallback(() =>
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1)), [photos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const currentPhoto = photos[index];
  const hasMultiple = photos.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Photos of ${member.name}`}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl"
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

        {/* Photo area */}
        <div className="relative aspect-4/3 w-full bg-black">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : currentPhoto ? (
            <Image
              src={currentPhoto}
              alt={`${member.name} photo ${index + 1}`}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-semibold text-white/40">
              {staffInitials(member.name)}
            </div>
          )}

          {/* Arrows */}
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

          {/* Dot indicators */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`size-2 rounded-full transition-all ${
                    i === index ? "bg-white scale-125" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Staff info */}
        <div className="flex items-start gap-4 p-5">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-primary">
              {member.name}, {member.credential}
            </h2>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {member.title}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
            {member.booking_url && (
              <a
                href={member.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-full bg-[#c9a96e] px-5 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
              >
                Book with {member.name.split(" ")[0]}
              </a>
            )}
          </div>
          {hasMultiple && (
            <p className="shrink-0 text-xs text-muted-foreground">
              {index + 1} / {photos.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
