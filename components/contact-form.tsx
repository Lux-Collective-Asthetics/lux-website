"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle } from "lucide-react";

import { submitContact, type ContactFormState } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState: ContactFormState = { status: "idle", message: "" };

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
        <CheckCircle className="mt-0.5 size-5 shrink-0 text-accent" />
        <div>
          <p className="font-medium text-primary">Message sent</p>
          <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">Privacy note:</strong> Do not include medical history, symptoms, treatment details, or any other health information. This form is for general inquiries only.
      </p>

      {state.status === "error" && !state.errors && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
          />
          {state.errors?.name && (
            <p id="name-error" role="alert" className="text-xs text-destructive">
              {state.errors.name[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          {state.errors?.email && (
            <p id="email-error" role="alert" className="text-xs text-destructive">
              {state.errors.email[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(state.errors?.message)}
          aria-describedby={state.errors?.message ? "message-error" : undefined}
        />
        {state.errors?.message && (
          <p id="message-error" role="alert" className="text-xs text-destructive">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      {turnstileSiteKey && (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-theme="light"
        />
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
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}
