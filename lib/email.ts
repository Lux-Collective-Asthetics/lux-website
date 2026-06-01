import { Resend } from "resend";

type ContactEmailData = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env: RESEND_API_KEY");
  }

  const to = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (to.length === 0) {
    throw new Error("No admin recipients configured: ADMIN_EMAILS is empty");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "noreply@send.theluxcollectiveaesthetics.com",
    replyTo: data.email,
    to,
    subject: `New contact from ${data.name}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
