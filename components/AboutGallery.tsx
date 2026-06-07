"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { AboutGalleryPhoto } from "@/lib/types/db";
import { useAboutGallery } from "@/lib/public-content-hooks";

type Props = {
  initialPhotos: AboutGalleryPhoto[];
};

export function AboutGallery({ initialPhotos }: Props) {
  const { data: photos } = useAboutGallery(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (lightboxIndex >= photos.length) setLightboxIndex(photos.length > 0 ? photos.length - 1 : null);
  }, [photos.length, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null || i === 0 ? photos.length - 1 : i - 1));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null || i === photos.length - 1 ? 0 : i + 1));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, photos.length]);

  if (photos.length === 0) return null;

  function prevLight() {
    setLightboxIndex((i) => (i === null ? null : i === 0 ? photos.length - 1 : i - 1));
  }
  function nextLight() {
    setLightboxIndex((i) => (i === null ? null : i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
          Our space &amp; team
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label={photo.caption ?? `Gallery photo ${i + 1}`}
              className="group relative overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="aspect-square">
                <Image
                  src={photo.photo_url}
                  alt={photo.caption ?? `Gallery photo ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs text-white">{photo.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {lightboxIndex !== null && lightboxIndex < photos.length && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <div
            className="relative flex h-full max-h-[90vh] w-full max-w-4xl items-center justify-center px-14"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex].photo_url}
              alt={photos[lightboxIndex].caption ?? `Photo ${lightboxIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />

            <button
              type="button"
              onClick={prevLight}
              aria-label="Previous photo"
              className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextLight}
              aria-label="Next photo"
              className="absolute right-3 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="size-4" />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
