import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_HOSTS } from "@/lib/admin-hosts";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const trustedHost = ALLOWED_HOSTS.has(url.host) ? url.host : "theluxcollectiveaesthetics.com";
  const origin = `${trustedHost.includes("localhost") ? "http" : "https"}://${trustedHost}`;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/admin/login?error=exchange_failed`);
  }

  if (!adminEmails.includes((data.user.email ?? "").toLowerCase())) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
  }

  return NextResponse.redirect(`${origin}/admin`);
}
