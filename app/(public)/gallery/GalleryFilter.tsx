"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types/db";

export function GalleryFilter({ images }: { images: GalleryImage[] }) {
  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category)))];
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? images : images.filter((i) => i.category === active);

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-medium tracking-wide transition-colors",
              active === cat
                ? "bg-[#c9a96e] text-white"
                : "border border-border text-muted-foreground hover:border-[#c9a96e]/50 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-0.5 md:grid-cols-3">
        {filtered.map((image, idx) => (
          <div
            key={image.id}
            className={cn(
              "group relative overflow-hidden bg-muted aspect-[4/5]",
              idx % 7 === 0 && "col-span-2"
            )}
          >
            <div className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#c9a96e]">
              {image.category}
            </div>

            <div className="relative flex h-full w-full transition-transform duration-300 group-hover:scale-[1.02]">
              <div className="relative h-full w-1/2 overflow-hidden">
                <Image
                  src={image.before_url}
                  alt={`${image.title} — Before`}
                  fill
                  sizes="(min-width: 768px) 25vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70">
                  Before
                </div>
              </div>
              <div className="absolute inset-y-0 left-1/2 z-10 w-px bg-white/20" />
              <div className="relative h-full w-1/2 overflow-hidden">
                <Image
                  src={image.after_url}
                  alt={`${image.title} — After`}
                  fill
                  sizes="(min-width: 768px) 25vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute bottom-2 right-2 rounded bg-[#c9a96e]/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                  After
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-sm font-medium text-white">{image.title}</p>
              {image.caption && (
                <p className="text-xs text-white/70">{image.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
