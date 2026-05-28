"use server";

import { headers } from "next/headers";

import { createServiceClient } from "@/lib/supabase/service";
import { newsletterRateLimit } from "@/lib/redis";

export type SubscribeState = {
  status: "idle" | "success" | "already" | "error";
  message: string;
  errors?: { email?: string[] };
};

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
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
    const ip = (await headers()).get("cf-connecting-ip") ?? "anonymous";
    const { success } = await newsletterRateLimit.limit(ip);
    if (!success) {
      return { status: "error", message: "Too many requests. Please try again later." };
    }
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = formData.get("cf-turnstile-response") as string | null;
    if (!token) {
      return { status: "error", message: "Please complete the security check." };
    }
    const verified = await verifyTurnstile(token, turnstileSecret);
    if (!verified) {
      return { status: "error", message: "Security check failed. Please refresh and try again." };
    }
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    if (existing.status === "active") {
      return { status: "already", message: "You're already on the list." };
    }
    await supabase
      .from("subscribers")
      .update({ status: "active", unsubscribed_at: null, subscribed_at: new Date().toISOString() })
      .eq("id", existing.id);
    return { status: "success", message: "Welcome back — you've been re-subscribed." };
  }

  const { error } = await supabase.from("subscribers").insert({ email });
  if (error) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return { status: "success", message: "You're on the list. We'll be in touch." };
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}
