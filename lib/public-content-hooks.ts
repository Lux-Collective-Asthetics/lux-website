"use client";

import { useQuery } from "@tanstack/react-query";

import type { ServiceGroup, Testimonial } from "@/content/site";
import type { AboutGalleryPhoto, GalleryImage, ServiceCategory, StaffMemberWithServices } from "@/lib/types/db";
import {
  fetchServiceCategories,
  fetchVisibleAboutGallery,
  fetchVisibleGalleryImages,
  fetchVisibleServiceGroups,
  fetchVisibleStaff,
  fetchVisibleTestimonials,
  publicContentQueryKeys,
} from "@/lib/public-content-cache";

// Setting initialDataUpdatedAt:0 tells React Query the initial data is from
// epoch 0 (always older than staleTime), so it refetches on mount rather than
// treating SSR-provided initialData as perpetually fresh.
const STALE_AT_ZERO = 0;

export function usePublicTestimonials(initialTestimonials: Testimonial[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.testimonials,
    queryFn: fetchVisibleTestimonials,
    initialData: initialTestimonials,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}

export function usePublicServiceGroups(initialServiceGroups: ServiceGroup[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.services,
    queryFn: fetchVisibleServiceGroups,
    initialData: initialServiceGroups,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}

export function usePublicStaff(initialStaff: StaffMemberWithServices[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.staff,
    queryFn: fetchVisibleStaff,
    initialData: initialStaff,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}

export function usePublicGalleryImages(initialImages: GalleryImage[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.gallery,
    queryFn: fetchVisibleGalleryImages,
    initialData: initialImages,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}

export function useAboutGallery(initialPhotos: AboutGalleryPhoto[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.aboutGallery,
    queryFn: fetchVisibleAboutGallery,
    initialData: initialPhotos,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}

export function usePublicServiceCategories(initialCategories: ServiceCategory[]) {
  return useQuery({
    queryKey: publicContentQueryKeys.serviceCategories,
    queryFn: fetchServiceCategories,
    initialData: initialCategories,
    initialDataUpdatedAt: STALE_AT_ZERO,
    refetchInterval: false,
  });
}
