import "server-only";
import { Resend } from "resend";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing env: RESEND_API_KEY");
  return new Resend(key);
}

// Adds or re-activates a contact in the Resend Audience.
// Non-blocking: caller should .catch() errors.
export async function addContact(email: string): Promise<void> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return;
  const resend = client();
  const { error } = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  });
  if (error) throw new Error(`[resend] addContact: ${error.message}`);
}

// Removes a contact from the Resend Audience by email.
// Uses the REST API directly because the SDK remove() requires a contact UUID.
// Non-blocking: caller should .catch() errors.
export async function removeContact(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

// Sends a welcome email to a new subscriber.
// Includes their personal unsubscribe link via token.
// Non-blocking: caller should .catch() errors.
export async function sendWelcomeEmail(email: string, token: string): Promise<void> {
  const resend = client();
  const unsubscribeUrl = `https://theluxcollectiveaesthetics.com/unsubscribe?token=${token}`;
  const { error } = await resend.emails.send({
    from: "The Lux Collective <noreply@theluxcollectiveaesthetics.com>",
    to: email,
    subject: "Welcome to The Lux Collective",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #fff;">
  <div style="border-bottom: 2px solid #c9a96e; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #c9a96e; letter-spacing: 0.1em; font-size: 1rem; text-transform: uppercase;">The Lux Collective</h2>
  </div>
  <p style="line-height: 1.7;">Thank you for subscribing. You'll be the first to know about new services, seasonal offers, and beauty tips from our team.</p>
  <p style="line-height: 1.7;">We can't wait to connect with you.</p>
  <p style="line-height: 1.7;">— The Lux Collective Team</p>
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 0.75rem; color: #888; line-height: 1.5;">
    <p style="margin: 0;">The Lux Collective Aesthetics<br />[SALON STREET ADDRESS]<br />[CITY, STATE ZIP]</p>
    <p style="margin: 8px 0 0;"><a href="${unsubscribeUrl}" style="color: #888; text-decoration: underline;">Unsubscribe</a></p>
  </div>
</body>
</html>`,
  });
  if (error) throw new Error(`[resend] sendWelcomeEmail: ${error.message}`);
}

type BroadcastOptions = {
  subject: string;
  html: string;
  scheduledAt?: string; // ISO 8601 string, e.g. "2026-06-10T14:00:00Z"
};

// Creates and sends (or schedules) a broadcast to RESEND_SEGMENT_ID.
// Throws on failure — caller must surface error to the admin.
// Returns the Resend broadcast ID for logging.
export async function createAndSendBroadcast(opts: BroadcastOptions): Promise<string> {
  const segmentId = process.env.RESEND_SEGMENT_ID;
  if (!segmentId) throw new Error("Missing env: RESEND_SEGMENT_ID");
  const resend = client();

  const params: Parameters<typeof resend.broadcasts.create>[0] = {
    segmentId,
    from: "The Lux Collective <noreply@theluxcollectiveaesthetics.com>",
    subject: opts.subject,
    html: opts.html,
    send: true,
    ...(opts.scheduledAt ? { scheduled_at: opts.scheduledAt } : {}),
  };

  const { data, error } = await resend.broadcasts.create(params);
  if (error || !data) throw new Error(`[resend] createAndSendBroadcast: ${error?.message ?? "no data"}`);
  return data.id;
}
