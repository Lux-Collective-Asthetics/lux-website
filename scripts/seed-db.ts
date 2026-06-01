/**
 * One-time seed script: reads content/site.ts and inserts into Supabase.
 * Run with: npx tsx scripts/seed-db.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run supabase/schema.sql in the Supabase dashboard first if tables don't exist yet.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { serviceGroups, staff, testimonials } from "../content/site";

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
  // Guard: skip if data already exists
  const { count: serviceCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });

  if (serviceCount && serviceCount > 0) {
    console.log(`DB already has ${serviceCount} services — skipping seed. Delete existing rows first to re-seed.`);
    return;
  }

  console.log("Seeding services...");
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

      if (svcErr) throw new Error(`Service insert failed: ${svcErr.message}`);

      const priceLines = svc.priceLines.map((line, idx) => ({
        service_id: serviceRow.id,
        ...parsePriceLine(line),
        display_order: idx,
      }));

      const { error: plErr } = await supabase.from("service_price_lines").insert(priceLines);
      if (plErr) throw new Error(`Price lines insert failed: ${plErr.message}`);
    }
  }

  console.log("Seeding staff...");
  for (let i = 0; i < staff.length; i++) {
    const member = staff[i];
    const { error } = await supabase.from("staff_members").insert({
      name: member.name,
      credential: member.credential,
      title: member.title,
      bio: member.bio,
      display_order: i,
    });
    if (error) throw new Error(`Staff insert failed: ${error.message}`);
  }

  console.log("Seeding testimonials...");
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    const { error } = await supabase.from("testimonials").insert({
      quote: t.quote,
      author: t.author,
      display_order: i,
    });
    if (error) throw new Error(`Testimonial insert failed: ${error.message}`);
  }

  console.log("Done! All content seeded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
