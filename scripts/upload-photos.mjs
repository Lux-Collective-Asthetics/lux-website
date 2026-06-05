/**
 * Upload local photos to Supabase Storage and optionally seed them into
 * the about_gallery or staff_photos tables.
 *
 * Usage:
 *   node scripts/upload-photos.mjs --target about-gallery --dir ./photos/about
 *   node scripts/upload-photos.mjs --target staff --staff-id <uuid> --dir ./photos/megan
 *
 * Requires env vars (copy from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { extname, basename, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const BUCKET = "lux-staff";

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target")    result.target   = args[++i];
    if (args[i] === "--dir")       result.dir      = args[++i];
    if (args[i] === "--staff-id")  result.staffId  = args[++i];
  }
  return result;
}

async function main() {
  const { target, dir, staffId } = parseArgs();

  if (!target || !dir) {
    console.error("Usage: node scripts/upload-photos.mjs --target <about-gallery|staff> --dir <path> [--staff-id <uuid>]");
    process.exit(1);
  }
  if (target === "staff" && !staffId) {
    console.error("--staff-id is required when target is 'staff'");
    process.exit(1);
  }

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const absDir   = resolve(dir);
  const entries  = await readdir(absDir);
  const images   = entries.filter((f) => ALLOWED_EXTS.has(extname(f).toLowerCase()));

  if (images.length === 0) {
    console.log("No supported image files found in", absDir);
    process.exit(0);
  }

  console.log(`Uploading ${images.length} image(s) from ${absDir} → ${BUCKET}…\n`);

  for (let i = 0; i < images.length; i++) {
    const filename = images[i];
    const ext      = extname(filename).toLowerCase();
    const mimeMap  = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
    const mime     = mimeMap[ext] ?? "image/jpeg";
    const storagePath = `${randomUUID()}${ext}`;
    const filePath = join(absDir, filename);

    process.stdout.write(`[${i + 1}/${images.length}] ${filename} … `);

    const buffer = await readFile(filePath);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: mime, upsert: false });

    if (uploadError) {
      console.error(`FAILED: ${uploadError.message}`);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    if (target === "about-gallery") {
      const { error } = await supabase.from("about_gallery").insert({
        photo_url: publicUrl,
        caption: basename(filename, ext).replace(/[-_]/g, " "),
        display_order: i,
        is_visible: true,
      });
      if (error) { console.error(`DB insert failed: ${error.message}`); continue; }
    } else if (target === "staff") {
      const { error } = await supabase.from("staff_photos").insert({
        staff_id: staffId,
        photo_url: publicUrl,
        display_order: i,
      });
      if (error) { console.error(`DB insert failed: ${error.message}`); continue; }
    }

    console.log("OK →", publicUrl);
  }

  console.log("\nDone.");
}

main().catch((err) => { console.error(err); process.exit(1); });
