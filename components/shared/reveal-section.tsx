"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type RevealSectionProps = {
  className?: string;
  children: React.ReactNode;
};

export function RevealSection({ className, children }: RevealSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fire 150px before the section enters the viewport so content fades in
    // before the user reaches it — eliminates the blank-then-appear effect.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 150px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={cn("reveal", className)}>
      {children}
    </section>
  );
}
