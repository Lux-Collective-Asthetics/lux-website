"use server";

import { headers } from "next/headers";

import { createServiceClient } from "@/lib/supabase/service";
import { newsletterRateLimit } from "@/lib/redis";
import { verifyTurnstile } from "@/lib/turnstile";

export type SubscribeState = {
  status: "idle" | "success" | "already" | "error";
  message: string;
  errors?: { email?: string[] };
};

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const website = (formData.get("website") as string | null)?.trim() ?? "";
  if (website) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";

  const errors: SubscribeState["errors"] = {};
  if (!email) {
    errors.email = ["Email is required."];
  } else if (email.length > 320) {
    errors.email = ["Email is too long."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please fix the errors below.", errors };
  }

  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const hdrs = await headers();
      const forwarded = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim();
      const ip = hdrs.get("cf-connecting-ip") ?? forwarded;
      const key = ip ? `ip:${ip}` : `email:${email}`;
      const { success } = await newsletterRateLimit.limit(key);
      if (!success) {
        return { status: "error", message: "Too many requests. Please try again later." };
      }
    } catch (err) {
      console.error("[newsletter] rate limit check failed:", err);
      return { status: "error", message: "Rate limit service unavailable. Please try again later." };
    }
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = formData.get("cf-turnstile-response") as string | null;
    if (!token) {
      return { status: "error", message: "Please complete the security check." };
    }
    try {
      const verified = await verifyTurnstile(token, turnstileSecret);
      if (!verified) {
        return { status: "error", message: "Security check failed. Please refresh and try again." };
      }
    } catch (err) {
      console.error("[newsletter] Turnstile verification failed:", err);
      return { status: "error", message: "Security check service unavailable. Please try again later." };
    }
  }

  const supabase = createServiceClient();

  const { data: existing, error: selectError } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (selectError) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  if (existing?.status === "active") {
    return { status: "success", message: "You're on the list. We'll be in touch." };
  }

  const now = new Date().toISOString();
  const isResubscription = !!existing;

  const { error: upsertError } = await supabase
    .from("subscribers")
    .upsert(
      { email, status: "active", subscribed_at: now, unsubscribed_at: null },
      { onConflict: "email" },
    );

  if (upsertError) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return {
    status: "success",
    message: isResubscription
      ? "Welcome back — you've been re-subscribed."
      : "You're on the list. We'll be in touch.",
  };
}
