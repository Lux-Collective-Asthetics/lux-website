"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";

export async function createNewsletterSend(data: {
  campaign_name: string;
  subject: string;
  resend_broadcast_id: string;
  sent_at: string;
  recipient_count: number;
}) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("newsletter_sends").insert({
    campaign_name: data.campaign_name,
    subject: data.subject,
    resend_broadcast_id: data.resend_broadcast_id,
    sent_at: data.sent_at || null,
    recipient_count: data.recipient_count,
    open_count: 0,
    click_count: 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/newsletters");
}
