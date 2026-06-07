import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";
import { removeContact } from "@/lib/resend-audience";

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    redirect("/unsubscribed?result=invalid");
  }

  const safeToken = escapeHtml(token);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribe | The Lux Collective</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 4rem auto; padding: 0 1.5rem; color: #1a1a1a; }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #555; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.5rem 1.25rem; background: #1a1a1a; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; text-decoration: none; }
    .cancel { margin-left: 1rem; font-size: 0.9rem; color: #555; text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Unsubscribe from the newsletter?</h1>
  <p>You'll stop receiving emails from The Lux Collective.</p>
  <form method="POST" action="/unsubscribe">
    <input type="hidden" name="token" value="${safeToken}" />
    <button type="submit" class="btn">Yes, unsubscribe me</button>
    <a href="/" class="cancel">Cancel</a>
  </form>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token");

  if (typeof token !== "string" || !token) {
    redirect("/unsubscribed?result=invalid");
  }

  const supabase = createServiceClient();

  const { data: subscriber, error: selectError } = await supabase
    .from("subscribers")
    .select("id, status, email")
    .eq("token", token)
    .maybeSingle();

  if (selectError) {
    redirect("/unsubscribed?result=error");
  }

  if (!subscriber) {
    redirect("/unsubscribed?result=invalid");
  }

  if (subscriber.status === "unsubscribed") {
    redirect("/unsubscribed?result=already");
  }

  const { error: updateError } = await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  if (updateError) {
    redirect("/unsubscribed?result=error");
  }

  // Non-blocking: remove from Resend Audience. Unsubscribe still succeeds if this fails.
  removeContact(subscriber.email).catch((err) =>
    console.error("[resend] removeContact failed:", err)
  );

  redirect("/unsubscribed?result=success");
}
