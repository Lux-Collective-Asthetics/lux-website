"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";
import { createAndSendBroadcast } from "@/lib/resend-audience";
import { business } from "@/content/site";

export async function createNewsletterSend(data: {
  campaign_name: string;
  subject: string;
  resend_broadcast_id: string;
  sent_at: string;
  recipient_count: number;
}) {
  await requireAdmin();
  if (!data.campaign_name?.trim()) throw new Error("Campaign name is required");
  if (!data.subject?.trim()) throw new Error("Subject is required");
  if (!data.resend_broadcast_id?.trim()) throw new Error("Resend broadcast ID is required");
  if (data.recipient_count < 0) throw new Error("Recipient count cannot be negative");
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

function wrapEmailHtml(bodyHtml: string, subject: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject.replace(/</g, "&lt;")}</title>
</head>
<body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #fff;">
  <div style="border-bottom: 2px solid #c9a96e; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #c9a96e; letter-spacing: 0.1em; font-size: 1rem; text-transform: uppercase;">The Lux Collective</h2>
  </div>
  <div style="line-height: 1.7; font-size: 1rem;">
    ${bodyHtml}
  </div>
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 0.75rem; color: #888; line-height: 1.5;">
    <p style="margin: 0;">${business.name}<br />${business.address.street}<br />${business.address.city}, ${business.address.state} ${business.address.zip}</p>
    <p style="margin: 8px 0 0;">
      <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #888; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

export async function sendNewsletter(data: {
  subject: string;
  bodyHtml: string;
  scheduledAt?: string;
}) {
  await requireAdmin();
  if (!data.subject?.trim()) throw new Error("Subject is required");
  if (!data.bodyHtml?.trim()) throw new Error("Body is required");

  const wrappedHtml = wrapEmailHtml(data.bodyHtml, data.subject);
  const broadcastId = await createAndSendBroadcast({
    subject: data.subject,
    html: wrappedHtml,
    scheduledAt: data.scheduledAt || undefined,
  });

  const supabase = createServiceClient();
  const { error } = await supabase.from("newsletter_sends").insert({
    campaign_name: data.subject,
    subject: data.subject,
    resend_broadcast_id: broadcastId,
    sent_at: data.scheduledAt || new Date().toISOString(),
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/newsletters");
}
