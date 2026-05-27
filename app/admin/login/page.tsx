"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendLoginEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string; sent?: boolean };
const initialState: State = {};

export default function AdminLoginPage() {
  const [state, formAction] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await sendLoginEmail(_prev, formData);
      return result.error ? { error: result.error } : { sent: true };
    },
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            Admin
          </p>
          <h1 className="mt-2 font-heading text-3xl text-primary">
            The Lux Collective
          </h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to receive a sign-in link.
          </p>

          {state.error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {state.error}
            </p>
          )}

          {state.sent ? (
            <div className="mt-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              If that address is authorized, a sign-in link is on its way. Check your inbox.
            </div>
          ) : (
            <form action={formAction} className="mt-5 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <SubmitButton />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send sign-in link"}
    </Button>
  );
}
