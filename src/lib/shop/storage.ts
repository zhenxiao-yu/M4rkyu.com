import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// Upload a single image to the shop-images Supabase Storage bucket.
// Returns the storage path on success, null on failure. Admin RLS
// policy on storage.objects gates the actual write — this helper makes
// no assumption about who's calling it. File-size + MIME validation
// lives in the bucket policy itself (see migration 20260520000700).

const BUCKET = "shop-images";

export interface UploadedImage {
  path: string;
  mime: string;
  size: number;
}

export async function uploadProductImage(
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
  return { path: data.path, mime: file.type, size: file.size };
}

export async function deleteProductImage(path: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}

function sanitizePath(hint: string, originalName: string): string {
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
