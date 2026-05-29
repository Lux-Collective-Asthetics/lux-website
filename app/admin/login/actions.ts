"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_HOSTS } from "@/lib/admin-hosts";

export async function signInWithGoogle() {
  const headersList = await headers();
  const rawHost =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const host = ALLOWED_HOSTS.has(rawHost) ? rawHost : "theluxcollectiveaesthetics.com";
  const protocol = host.includes("localhost") ? "http" : "https";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${protocol}://${host}/admin/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/admin/login?error=oauth_failed");
  }

  redirect(data.url);
}
