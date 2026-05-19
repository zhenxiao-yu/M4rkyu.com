import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// Upload a single image to the gallery-images Supabase Storage bucket.
// Returns the storage path on success, null on failure. Admin RLS
// policy on storage.objects gates the actual write — this helper
// makes no assumption about who's calling it.
//
// File-size + MIME validation lives in the bucket policy itself (see
// migration 20260519015546). We add a cheap client-side preflight on
// dimensions only to populate the gallery_items.width/height columns.

const BUCKET = "gallery-images";

export interface UploadedImage {
  path: string;
  mime: string;
  size: number;
}

export async function uploadGalleryImage(
  file: File,
  pathHint: string,
): Promise<UploadedImage | null> {
  const supabase = await createSupabaseServerClient();
  const safePath = sanitizePath(pathHint, file.name);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(safePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error || !data) return null;
  return {
    path: data.path,
    mime: file.type,
    size: file.size,
  };
}

export async function deleteGalleryImage(path: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}

function sanitizePath(hint: string, originalName: string): string {
  // Keep slashes (for collection-slug subdirectories), lowercase
  // everything else, replace anything else with `-`. Append a short
  // timestamp suffix so re-uploading the same filename doesn't trip
  // the bucket's `upsert: false` flag.
  const ext = extensionOf(originalName);
  const base = hint
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const stamp = Date.now().toString(36);
  return `${base}-${stamp}${ext}`;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  const ext = name.slice(dot).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}
