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
  console.log("Clearing existing services (price lines cascade)...");
  const { error: delSvcErr } = await supabase.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delSvcErr) throw new Error(`Failed to delete services: ${delSvcErr.message}`);

  console.log("Clearing existing service categories...");
  const { error: delCatErr } = await supabase.from("service_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delCatErr) throw new Error(`Failed to delete categories: ${delCatErr.message}`);

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

  console.log("Done! Services and categories reseeded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
