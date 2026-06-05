import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_BUCKETS = ["lux-gallery", "lux-testimonials", "lux-services", "lux-staff"] as const;
type AllowedBucket = typeof ALLOWED_BUCKETS[number];

// SVG is excluded — it can carry JavaScript and cause stored XSS when served from Storage
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!adminEmails.includes((user.email ?? "").toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null;

  if (!file || !bucket) {
    return NextResponse.json({ error: "file and bucket are required" }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const safeExt = ALLOWED_MIME_TYPES[file.type];
  if (!safeExt) {
    return NextResponse.json(
      { error: "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF, AVIF" },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });
  }

  // Filename and content-type come from the validated allowlist, not client input
  const filename = `${crypto.randomUUID()}.${safeExt}`;
  const contentType = file.type; // safe because it passed the allowlist check above

  // Upload via service role client
  const serviceClient = createServiceClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await serviceClient.storage
    .from(bucket)
    .upload(filename, arrayBuffer, { contentType, upsert: false });

  if (error) {
    console.error("[upload] Supabase Storage error:", error.message, { bucket, filename });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = serviceClient.storage.from(bucket).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
