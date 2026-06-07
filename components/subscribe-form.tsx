"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

import { subscribe, type SubscribeState } from "@/app/(public)/newsletter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { cn } from "@/lib/utils";

const initialState: SubscribeState = { status: "idle", message: "" };

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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

  if (state.status === "already_subscribed") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
        <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-primary">Already subscribed</p>
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
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
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
          <p id="sub-email-error" role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
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
