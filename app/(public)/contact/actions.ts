"use server";

import { headers } from "next/headers";

import { sendContactEmail } from "@/lib/email";
import { contactRateLimit } from "@/lib/redis";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  const errors: ContactFormState["errors"] = {};

  if (!name) {
    errors.name = ["Name is required."];
  } else if (name.length > 100) {
    errors.name = ["Name is too long."];
  }
  if (!email) {
    errors.email = ["Email is required."];
  } else if (email.length > 320) {
    errors.email = ["Email is too long."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }
  if (!message) {
    errors.message = ["Message is required."];
  } else if (message.length < 10) {
    errors.message = ["Message must be at least 10 characters."];
  } else if (message.length > 5000) {
    errors.message = ["Message is too long (5000 character limit)."];
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please fix the errors below.", errors };
  }

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const ip = (await headers()).get("cf-connecting-ip") ?? "anonymous";
    const { success } = await contactRateLimit.limit(ip);
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
      return {
        status: "error",
        message: "Security check failed. Please refresh and try again.",
      };
    }
  }

  await sendContactEmail({ name, email, message });

  return {
    status: "success",
    message: "Message sent. We'll be in touch soon — usually within one business day.",
  };
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
