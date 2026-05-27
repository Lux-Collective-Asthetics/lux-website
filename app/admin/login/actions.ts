"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function sendLoginEmail(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";

  if (!email) return { error: "Email is required." };

  // Always return the same message whether or not we actually sent — prevents enumeration
  if (!adminEmails.includes(email)) {
    return {};
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${protocol}://${host}/admin/auth/callback`,
    },
  });

  if (error) {
    console.error("[admin/login] OTP error:", error.message);
    return { error: "Could not send login email. Please try again." };
  }

  return {};
}
