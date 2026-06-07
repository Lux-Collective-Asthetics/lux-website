"use client";

import * as React from "react";
import { HTMLMotionProps, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface HoverSliderImageProps {
  index: number;
  imageUrl: string;
}

interface HoverSliderContextValue {
  activeSlide: number;
  changeSlide: (index: number) => void;
}

const HoverSliderContext = React.createContext<HoverSliderContextValue | undefined>(undefined);

export function useHoverSliderContext() {
  const ctx = React.useContext(HoverSliderContext);
  if (!ctx) throw new Error("useHoverSliderContext must be used within HoverSlider");
  return ctx;
}

export const HoverSlider = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ children, className, ...props }, ref) => {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const changeSlide = React.useCallback((i: number) => setActiveSlide(i), []);
  return (
    <HoverSliderContext.Provider value={{ activeSlide, changeSlide }}>
      <div ref={ref as React.Ref<HTMLDivElement>} className={className} {...props}>{children}</div>
    </HoverSliderContext.Provider>
  );
});
HoverSlider.displayName = "HoverSlider";

// Inactive images snap to hidden instantly so they don't cross-wipe with the
// entering image and create a split-screen artifact.
export const clipPathVariants = {
  visible: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    transition: { ease: [0.33, 1, 0.68, 1] as [number, number, number, number], duration: 0.8 },
  },
  hidden: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0px)",
    transition: { duration: 0 },
  },
};

export const HoverSliderImageWrap = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  />
));
HoverSliderImageWrap.displayName = "HoverSliderImageWrap";

export const HoverSliderImage = React.forwardRef<
  HTMLImageElement,
  HTMLMotionProps<"img"> & HoverSliderImageProps
>(({ index, imageUrl, className, style, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext();
  const isActive = activeSlide === index;
  return (
    <motion.img
      src={imageUrl}
      className={cn("absolute inset-0 block w-full h-full object-contain", className)}
      variants={clipPathVariants}
      animate={isActive ? "visible" : "hidden"}
      style={{ zIndex: isActive ? 1 : 0, ...style }}
      ref={ref}
      {...props}
    />
  );
});
HoverSliderImage.displayName = "HoverSliderImage";
