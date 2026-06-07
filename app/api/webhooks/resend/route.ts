import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "contact.unsubscribed") {
    const email = event.data?.email as string | undefined;
    if (email) {
      const { error: updateError } = await supabase
        .from("subscribers")
        .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
        .eq("email", email)
        .eq("status", "active");
      if (updateError) {
        console.error("[webhook] failed to mark subscriber unsubscribed:", updateError.message);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true });
  }

  const broadcastId = event.data?.broadcast_id as string | undefined;

  if (!broadcastId) {
    return NextResponse.json({ ok: true });
  }

  if (event.type === "email.opened") {
    const { data } = await supabase
      .from("newsletter_sends")
      .select("open_count")
      .eq("resend_broadcast_id", broadcastId)
      .single();
    if (data) {
      await supabase
        .from("newsletter_sends")
        .update({ open_count: (data.open_count as number) + 1 })
        .eq("resend_broadcast_id", broadcastId);
    }
  } else if (event.type === "email.clicked") {
    const { data } = await supabase
      .from("newsletter_sends")
      .select("click_count")
      .eq("resend_broadcast_id", broadcastId)
      .single();
    if (data) {
      await supabase
        .from("newsletter_sends")
        .update({ click_count: (data.click_count as number) + 1 })
        .eq("resend_broadcast_id", broadcastId);
    }
  }

  return NextResponse.json({ ok: true });
}
