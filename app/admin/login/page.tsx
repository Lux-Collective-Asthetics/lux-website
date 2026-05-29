import { signInWithGoogle } from "./actions";
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, string> = {
  oauth_failed: "Could not start Google sign-in. Please try again.",
  exchange_failed: "Sign-in could not be completed. Please try again.",
  unauthorized: "That Google account is not authorized for admin access.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
            Use your Lux Collective Google account.
          </p>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {errorMessages[error] ?? "Something went wrong. Please try again."}
            </p>
          )}

          <form action={signInWithGoogle} className="mt-6">
            <Button type="submit" className="w-full gap-2">
              <GoogleIcon />
              Continue with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
