"use client";

import { useQuery } from "@tanstack/react-query";

import type { ServiceGroup, Testimonial } from "@/content/site";
import type { GalleryImage, StaffMember } from "@/lib/types/db";
import {
  fetchVisibleGalleryImages,
  fetchVisibleServiceGroups,
  fetchVisibleStaff,
  fetchVisibleTestimonials,
  publicContentQueryKeys,
} from "@/lib/public-content-cache";

const liveContentOptions = {
  refetchInterval: 5000,
};

export function usePublicTestimonials(initialTestimonials: Testimonial[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.testimonials,
    queryFn: fetchVisibleTestimonials,
    initialData: initialTestimonials,
    ...liveContentOptions,
  });
}

export function usePublicServiceGroups(initialServiceGroups: ServiceGroup[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.services,
    queryFn: fetchVisibleServiceGroups,
    initialData: initialServiceGroups,
    ...liveContentOptions,
  });
}

export function usePublicStaff(initialStaff: StaffMember[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.staff,
    queryFn: fetchVisibleStaff,
    initialData: initialStaff,
    ...liveContentOptions,
  });
}

export function usePublicGalleryImages(initialImages: GalleryImage[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.gallery,
    queryFn: fetchVisibleGalleryImages,
    initialData: initialImages,
    ...liveContentOptions,
  });
}
