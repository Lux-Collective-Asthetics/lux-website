import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You've been removed from The Lux Collective newsletter.",
  robots: { index: false, follow: false },
};

const messages = {
  success: {
    heading: "You've been unsubscribed.",
    body: "You won't receive any more emails from us. If you change your mind, you can always resubscribe.",
  },
  already: {
    heading: "Already unsubscribed.",
    body: "This email address is already removed from our list.",
  },
  error: {
    heading: "Something went wrong.",
    body: "We couldn't process your request. Please try again or contact us for help.",
  },
  invalid: {
    heading: "Invalid link.",
    body: "This unsubscribe link is invalid or has expired.",
  },
} as const;

type Result = keyof typeof messages;

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const { result } = await searchParams;
  const key: Result =
    result === "already" || result === "success" || result === "error" ? result : "invalid";
  const { heading, body } = messages[key];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl text-primary">{heading}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{body}</p>
      {key === "success" && (
        <Link
          href="/newsletter"
          className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          Resubscribe
        </Link>
      )}
    </div>
  );
}
