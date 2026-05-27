"use client";

export type AnalyticsEvent =
  | "book_click"
  | "service_card_view"
  | "contact_click"
  | "newsletter_interest";

export function track(event: AnalyticsEvent, properties?: Record<string, string>) {
  window.dispatchEvent(
    new CustomEvent("lux:track", {
      detail: { event, properties },
    }),
  );
}
