import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    redirect("/unsubscribed?result=invalid");
  }

  const supabase = createServiceClient();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("token", token)
    .maybeSingle();

  if (!subscriber) {
    redirect("/unsubscribed?result=invalid");
  }

  if (subscriber.status === "unsubscribed") {
    redirect("/unsubscribed?result=already");
  }

  await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  redirect("/unsubscribed?result=success");
}
