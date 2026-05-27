"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
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
