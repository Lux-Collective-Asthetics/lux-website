type ContactEmailData = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[contact] email stub (RESEND_API_KEY not set):", data);
    return;
  }

  // TODO: npm install resend, then replace this stub:
  //   const { Resend } = await import('resend');
  //   const resend = new Resend(apiKey);
  //   await resend.emails.send({
  //     from: 'noreply@send.theluxcollectiveaesthetics.com',
  //     to: process.env.ADMIN_EMAILS?.split(',') ?? [],
  //     subject: `New contact from ${data.name}`,
  //     text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
  //   });
  console.warn("[contact] RESEND_API_KEY is set but Resend package is not yet installed.");
}
