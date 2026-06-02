"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { publicContentQueryKeys } from "@/lib/public-content-cache";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      })
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("public-content-cache")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "testimonials" },
        () => queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.testimonials })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        () => {
          queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.services });
          queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.staff });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_price_lines" },
        () => queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.services })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_members" },
        () => queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.staff })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_services" },
        () => queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.staff })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_images" },
        () => queryClient.invalidateQueries({ queryKey: publicContentQueryKeys.gallery })
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
