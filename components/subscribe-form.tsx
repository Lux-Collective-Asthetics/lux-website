"use client";

import { useActionState, useLayoutEffect, useRef } from "react";
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
    turnstile?: { remove: (id: string) => void };
  }
}

// Separate component so its useLayoutEffect cleanup fires on unmount,
// which React runs before removing DOM nodes — giving us a valid el.id.
function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    return () => {
      if (el?.id) window.turnstile?.remove(el.id);
    };
  }, []);

  return (
    <div ref={ref} className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
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

      {turnstileSiteKey && <TurnstileWidget siteKey={turnstileSiteKey} />}

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
      {pending ? "Subscribing…" : "Subscribe"}
    </Button>
  );
}
