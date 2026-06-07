/**
 * Replaces all service and service_category rows with data from content/site.ts.
 * Staff and testimonials are left untouched.
 * Run with: npx tsx scripts/reseed-services.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { serviceGroups } from "../content/site";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parsePriceLine(line: string): { label: string; price: string } {
  const colonIdx = line.indexOf(": ");
  if (colonIdx === -1) return { label: line, price: "" };
  return { label: line.slice(0, colonIdx), price: line.slice(colonIdx + 2) };
}

async function main() {
  // Snapshot staff_services before deletion (cascade will wipe them when services are deleted).
  // NOTE: supabase-js has no transaction API; operations below are best-effort ordered.
  // For true atomicity add a direct-postgres connection (pg package) or a DB RPC.
  console.log("Caching staff_services before reseed...");
  const { data: ssRows, error: ssReadErr } = await supabase
    .from("staff_services")
    .select("staff_id, service_id, services(name)");
  if (ssReadErr) throw new Error(`Failed to read staff_services: ${ssReadErr.message}`);

  type CachedLink = { staff_id: string; serviceName: string };
  const cachedLinks: CachedLink[] = (ssRows ?? []).map((row) => ({
    staff_id: row.staff_id as string,
    serviceName: ((row.services as unknown) as { name: string } | null)?.name ?? "",
  }));
  console.log(`  Cached ${cachedLinks.length} staff assignment(s).`);

  console.log("Clearing existing services (price lines and staff_services cascade)...");
  const { error: delSvcErr } = await supabase.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delSvcErr) throw new Error(`Failed to delete services: ${delSvcErr.message}`);

  console.log("Clearing existing service categories...");
  const { error: delCatErr } = await supabase.from("service_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delCatErr) throw new Error(`Failed to delete categories: ${delCatErr.message}`);

  // Track name → new UUID so we can remap staff assignments after insert.
  const nameToNewId = new Map<string, string>();

  console.log("Inserting services...");
  for (let gi = 0; gi < serviceGroups.length; gi++) {
    const group = serviceGroups[gi];
    for (let si = 0; si < group.services.length; si++) {
      const svc = group.services[si];
      const { data: serviceRow, error: svcErr } = await supabase
        .from("services")
        .insert({
          name: svc.name,
          summary: svc.summary,
          category: group.name,
          duration: svc.duration ?? null,
          display_order: gi * 100 + si,
        })
        .select("id")
        .single();

      if (svcErr) throw new Error(`Service insert failed for "${svc.name}": ${svcErr.message}`);

      nameToNewId.set(svc.name, serviceRow.id);

      const priceLines = svc.priceLines.map((line, idx) => ({
        service_id: serviceRow.id,
        ...parsePriceLine(line),
        display_order: idx,
      }));

      const { error: plErr } = await supabase.from("service_price_lines").insert(priceLines);
      if (plErr) throw new Error(`Price lines insert failed for "${svc.name}": ${plErr.message}`);

      console.log(`  ✓ ${group.name} / ${svc.name}`);
    }
  }

  console.log("Inserting service categories...");
  const categories = serviceGroups.map((g, i) => ({
    name: g.name,
    display_order: i,
  }));
  const { error: catErr } = await supabase.from("service_categories").insert(categories);
  if (catErr) throw new Error(`Category insert failed: ${catErr.message}`);

  // Restore staff assignments using the remapped service UUIDs.
  if (cachedLinks.length > 0) {
    console.log("Restoring staff_services...");
    const restoredLinks = cachedLinks
      .filter((l) => nameToNewId.has(l.serviceName))
      .map((l) => ({ staff_id: l.staff_id, service_id: nameToNewId.get(l.serviceName)! }));

    const skipped = cachedLinks.length - restoredLinks.length;
    if (skipped > 0) {
      console.warn(`  ⚠ Skipped ${skipped} assignment(s) — service name no longer exists in content/site.ts.`);
    }
    if (restoredLinks.length > 0) {
      const { error: ssRestoreErr } = await supabase.from("staff_services").insert(restoredLinks);
      if (ssRestoreErr) throw new Error(`Failed to restore staff_services: ${ssRestoreErr.message}`);
    }
    console.log(`  ✓ Restored ${restoredLinks.length} staff assignment(s).`);
  }

  console.log("Done! Services and categories reseeded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
