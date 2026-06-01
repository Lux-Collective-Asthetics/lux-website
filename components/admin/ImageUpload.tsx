"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  bucket: "lux-gallery" | "lux-testimonials" | "lux-services" | "lux-staff";
  onUpload: (publicUrl: string) => void;
  currentUrl?: string;
  accept?: string;
  maxMb?: number;
  label?: string;
};

export function ImageUpload({
  bucket,
  onUpload,
  currentUrl,
  accept = "image/*",
  maxMb = 10,
  label = "Upload image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    (f: File) => {
      setError(null);
      if (f.size > maxMb * 1024 * 1024) {
        setError(`File must be under ${maxMb} MB`);
        return;
      }
      setFile(f);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
    },
    [maxMb]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Upload failed");
      }
      const { url } = await res.json() as { url: string };
      onUpload(url);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const displayed = preview ?? currentUrl;

  return (
    <div className="space-y-3">
      {displayed && (
        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayed} alt="Preview" className="h-full w-full object-cover" />
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 hover:bg-background"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
          dragging ? "border-[#c9a96e] bg-[#fdf5e8]" : "border-border hover:border-[#c9a96e]/50 hover:bg-muted/40"
        )}
      >
        <ImageIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Click to browse</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">{label} · Max {maxMb} MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="size-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="size-4" /> Upload</>
          )}
        </button>
      )}
    </div>
  );
}
