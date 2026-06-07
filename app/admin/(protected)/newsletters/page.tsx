import { createServiceClient } from "@/lib/supabase/service";
import { NewslettersClient } from "./NewslettersClient";
import { sendNewsletter } from "./actions";
import type { NewsletterSend } from "@/lib/types/db";

export default async function NewslettersAdminPage() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("newsletter_sends")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <NewslettersClient
      initialSends={(data ?? []) as NewsletterSend[]}
      onSend={sendNewsletter}
    />
  );
}
