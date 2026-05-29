import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0 || !adminEmails.includes((user.email ?? "").toLowerCase())) {
    redirect("/admin/login");
  }

  const supabase = createServiceClient();
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("id, email, status, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-3xl text-primary">Subscribers</h1>
        <p className="mt-4 text-muted-foreground">Failed to load subscribers. Please try again.</p>
      </div>
    );
  }

  const active = subscribers?.filter((s) => s.status === "active").length ?? 0;
  const total = subscribers?.length ?? 0;

  return (
    <div>
      <h1 className="text-3xl text-primary">Subscribers</h1>
      <p className="mt-2 text-muted-foreground">
        {active} active &middot; {total} total
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers?.map((sub) => (
              <tr key={sub.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{sub.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      sub.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(sub.subscribed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {(!subscribers || subscribers.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
