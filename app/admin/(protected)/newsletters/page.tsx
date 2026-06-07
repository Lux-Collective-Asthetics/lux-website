import { createServiceClient } from "@/lib/supabase/service";
import { NewslettersClient } from "./NewslettersClient";
import { createNewsletterSend, sendNewsletter } from "./actions";
import type { NewsletterSend } from "@/lib/types/db";

export default async function NewslettersAdminPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("newsletter_sends")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <NewslettersClient
      initialSends={(data ?? []) as NewsletterSend[]}
      onCreate={createNewsletterSend}
      onSend={sendNewsletter}
    />
  );
}
