import { createClient } from "@/lib/supabase/server";
import { NewslettersClient } from "./NewslettersClient";
import { createNewsletterSend } from "./actions";
import type { NewsletterSend } from "@/lib/types/db";

export default async function NewslettersAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsletter_sends")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <NewslettersClient
      initialSends={(data ?? []) as NewsletterSend[]}
      onCreate={createNewsletterSend}
    />
  );
}
