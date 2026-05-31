import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Throws if the request is not from an authenticated admin email.
 * Must be called at the top of every admin server action — the (protected)
 * layout auth check does NOT run for direct server-action POST requests.
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes((user.email ?? "").toLowerCase())) {
    throw new Error("Forbidden");
  }
}
