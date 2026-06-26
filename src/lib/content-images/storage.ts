import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

// Shared helpers for the content-images Supabase Storage bucket, used by
// the projects (cover) and media (poster) CMS editors. Admin RLS on
// storage.objects gates the actual write; file-size + MIME validation
// lives in the bucket policy (see migration 20260520000800). Slug-
// prefixed paths (`projects/<slug>`, `media/<slug>`) keep the bucket
// organised without a bucket per content type.

const BUCKET = "content-images";

export interface UploadedImage {
  path: string;
  mime: string;
  size: number;
}

export async function uploadContentImage(
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

export async function deleteContentImage(path: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}

export function contentImageUrlFor(path: string | null): string | null {
  if (!path) return null;
  // Imported static content keeps its /public asset path; serve it as-is.
  if (path.startsWith("/")) return path;
  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
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
