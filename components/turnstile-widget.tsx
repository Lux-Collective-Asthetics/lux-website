"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: () => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          "unsupported-callback"?: () => void;
        },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const settled = useRef(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("Loading security check...");

  useEffect(() => {
    settled.current = false;
    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let iframeCheckId: ReturnType<typeof setTimeout> | null = null;

    const markUnavailable = (reason: string) => {
      settled.current = true;
      setLoadState("unavailable");
      setMessage(reason);
    };

    const renderWidget = () => {
      if (!ref.current || widgetId.current) return;

      if (window.turnstile?.render) {
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: "light",
          callback: () => { settled.current = true; setLoadState("ready"); },
          "error-callback": () =>
            markUnavailable("Security check failed. Make sure this domain is added to the Turnstile site key in Cloudflare."),
          "expired-callback": () => { settled.current = false; setLoadState("loading"); },
          "timeout-callback": () =>
            markUnavailable("Security check timed out. Refresh this page and try again."),
          "unsupported-callback": () =>
            markUnavailable("Security check is not supported in this browser."),
        });

        iframeCheckId = setTimeout(() => {
          if (settled.current) return;
          if (!ref.current?.querySelector("iframe")) {
            markUnavailable("Security check did not appear. Check that this domain is allowed for the Turnstile site key.");
          } else {
            setLoadState("ready");
          }
        }, 2500);

        return;
      }

      attempts += 1;
      if (attempts < 50) {
        timeoutId = setTimeout(renderWidget, 100);
      } else {
        setLoadState("unavailable");
      }
    };

    renderWidget();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (iframeCheckId) clearTimeout(iframeCheckId);
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div ref={ref} className="min-h-16.25" />
      {loadState === "loading" && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
      {loadState === "unavailable" && (
        <p role="alert" className="text-xs text-destructive">{message}</p>
      )}
    </div>
  );
}
