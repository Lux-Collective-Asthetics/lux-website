import { Resend } from "resend";

type ContactEmailData = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[contact] email stub — RESEND_API_KEY not set, payload suppressed");
    return;
  }

  const resend = new Resend(apiKey);
  const to = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  await resend.emails.send({
    from: "noreply@send.theluxcollectiveaesthetics.com",
    replyTo: data.email,
    to,
    subject: `New contact from ${data.name}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
  });
}
