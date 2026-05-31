"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_HOSTS } from "@/lib/admin-hosts";

export async function signInWithGoogle() {
  let origin: string;
  if (process.env.NODE_ENV === "development") {
    origin = "http://localhost:3000";
  } else {
    const headersList = await headers();
    const rawHost =
      headersList.get("x-forwarded-host") ??
      headersList.get("host") ??
      "theluxcollectiveaesthetics.com";
    const host = ALLOWED_HOSTS.has(rawHost) ? rawHost : "theluxcollectiveaesthetics.com";
    origin = `https://${host}`;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/admin/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/admin/login?error=oauth_failed");
  }

  redirect(data.url);
}
