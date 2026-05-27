"use client";

export type AnalyticsEvent =
  | "book_click"
  | "service_card_view"
  | "contact_click"
  | "newsletter_interest";

declare global {
  interface Window {
    zaraz?: { track: (event: string, properties?: Record<string, string>) => void };
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, string>) {
  if (typeof window === "undefined") return;

  // Forward to Cloudflare Zaraz if loaded (wired via CF dashboard to Web Analytics)
  window.zaraz?.track(event, properties);

  // Also dispatch a DOM event for local debugging / future listeners
  window.dispatchEvent(new CustomEvent("lux:track", { detail: { event, properties } }));
}
