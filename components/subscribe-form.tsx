"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle } from "lucide-react";

import { subscribe, type SubscribeState } from "@/app/(public)/newsletter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: SubscribeState = { status: "idle", message: "" };

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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

function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("Loading security check...");

  useEffect(() => {
    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let iframeCheckId: ReturnType<typeof setTimeout> | null = null;

    const markUnavailable = (reason: string) => {
      setLoadState("unavailable");
      setMessage(reason);
    };

    const renderWidget = () => {
      if (!ref.current || widgetId.current) {
        return;
      }

      if (window.turnstile?.render) {
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: "light",
          callback: () => setLoadState("ready"),
          "error-callback": () =>
            markUnavailable("Security check failed to render. Check the Turnstile site key and allowed domains."),
          "expired-callback": () => setLoadState("loading"),
          "timeout-callback": () =>
            markUnavailable("Security check timed out. Refresh this page and try again."),
          "unsupported-callback": () =>
            markUnavailable("Security check is not supported in this browser."),
        });

        iframeCheckId = setTimeout(() => {
          if (!ref.current?.querySelector("iframe")) {
            markUnavailable("Security check did not appear. Check that localhost is allowed for this Turnstile site key.");
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (iframeCheckId) {
        clearTimeout(iframeCheckId);
      }
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
      }
    };
  }, [siteKey]);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div ref={ref} className="min-h-[65px]" />
      {loadState === "loading" ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
      {loadState === "unavailable" ? (
        <p role="alert" className="text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function SubscribeForm() {
  const [state, formAction] = useActionState(subscribe, initialState);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
        <CheckCircle className="mt-0.5 size-5 shrink-0 text-accent" />
        <div>
          <p className="font-medium text-primary">You&apos;re subscribed</p>
          <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {state.status === "error" && !state.errors && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      {state.status === "already" && (
        <p role="status" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="sub-email">Email address</Label>
        <Input
          id="sub-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "sub-email-error" : undefined}
        />
        {state.errors?.email && (
          <p id="sub-email-error" role="alert" className="text-xs text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {turnstileSiteKey ? (
        <div>
          <p className="mt-1 text-xs text-muted-foreground">
            Security check powered by Cloudflare Turnstile.
          </p>
          <TurnstileWidget siteKey={turnstileSiteKey} />
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
          Turnstile is not configured for this environment. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to enable the bot check.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className={cn(pending && "opacity-70")}
    >
      {pending ? "Subscribing..." : "Subscribe"}
    </Button>
  );
}
