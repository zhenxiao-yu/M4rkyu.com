"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  uploadGalleryImage,
  deleteGalleryImage,
} from "@/lib/gallery/storage";

// Admin server actions. Every entry point re-runs requireAdmin() so
// a stale form post from a downgraded account can't sneak a mutation
// through — RLS on the underlying tables enforces the same thing,
// belt-and-suspenders.

const SLUG_RE = /^[a-z0-9-]+$/;
const STATUS_ENUM = z.enum(["ready", "draft", "placeholder", "coming-soon"]);
const ITEM_TYPE_ENUM = z.enum(["image", "contact-sheet", "process"]);
const ASPECT_ENUM = z.enum(["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"]);

const collectionSchema = z.object({
  slug: z.string().regex(SLUG_RE).min(1).max(80),
  title: z.string().min(1).max(120),
  description: z.string().max(600).default(""),
  status: STATUS_ENUM.default("placeholder"),
  sortOrder: z.coerce.number().int().default(0),
  featured: z.coerce.boolean().default(false),
});

const itemSchema = z.object({
  collectionId: z.string().uuid(),
  slug: z.string().regex(SLUG_RE).min(1).max(100),
  title: z.string().min(1).max(160),
  caption: z.string().max(1000).default(""),
  type: ITEM_TYPE_ENUM,
  status: STATUS_ENUM.default("placeholder"),
  alt: z.string().max(240).default(""),
  aspect: ASPECT_ENUM.default("4/5"),
  capturedAt: z.string().optional(),
  location: z.string().optional(),
  featured: z.coerce.boolean().default(false),
  pinned: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function booleanField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function createCollectionAction(formData: FormData) {
  await requireAdmin();
  const parsed = collectionSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    description: pickField(formData, "description"),
    status: pickField(formData, "status") || "placeholder",
    sortOrder: pickField(formData, "sortOrder") || "0",
    featured: booleanField(formData, "featured"),
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("gallery_collections").insert({
    slug: parsed.slug,
    title: parsed.title,
    description: parsed.description,
    status: parsed.status,
    sort_order: parsed.sortOrder,
    featured: parsed.featured,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
  redirect(`/admin/gallery/${parsed.slug}`);
}

export async function updateCollectionAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const parsed = collectionSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    description: pickField(formData, "description"),
    status: pickField(formData, "status") || "placeholder",
    sortOrder: pickField(formData, "sortOrder") || "0",
    featured: booleanField(formData, "featured"),
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("gallery_collections")
    .update({
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description,
      status: parsed.status,
      sort_order: parsed.sortOrder,
      featured: parsed.featured,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
}

export async function deleteCollectionAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  // Pull child items first so we can clean up storage objects. RLS
  // cascade on the table deletes the rows; storage objects orphan
  // unless we explicitly remove them here.
  const { data: items } = await supabase
    .from("gallery_items")
    .select("storage_path")
    .eq("collection_id", id);
  const paths = (items ?? [])
    .map((row) => row.storage_path as string | null)
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    await supabase.storage.from("gallery-images").remove(paths);
  }

  const { error } = await supabase
    .from("gallery_collections")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
  redirect("/admin/gallery");
}

export async function createItemAction(formData: FormData) {
  await requireAdmin();
  const parsed = itemSchema.parse({
    collectionId: pickField(formData, "collectionId"),
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    caption: pickField(formData, "caption"),
    type: pickField(formData, "type") || "image",
    status: pickField(formData, "status") || "placeholder",
    alt: pickField(formData, "alt"),
    aspect: pickField(formData, "aspect") || "4/5",
    capturedAt: pickField(formData, "capturedAt") || undefined,
    location: pickField(formData, "location") || undefined,
    featured: booleanField(formData, "featured"),
    pinned: booleanField(formData, "pinned"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });

  // Resolve the collection slug for the storage path prefix + redirect.
  const supabase = await createSupabaseServerClient();
  const { data: collectionRow } = await supabase
    .from("gallery_collections")
    .select("slug")
    .eq("id", parsed.collectionId)
    .maybeSingle();
  const collectionSlug = (collectionRow?.slug as string | undefined) ?? "misc";

  let storagePath: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadGalleryImage(
      file,
      `${collectionSlug}/${parsed.slug}`,
    );
    if (!upload) throw new Error("upload failed");
    storagePath = upload.path;
  }

  const { error } = await supabase.from("gallery_items").insert({
    collection_id: parsed.collectionId,
    slug: parsed.slug,
    title: parsed.title,
    caption: parsed.caption,
    type: parsed.type,
    status: parsed.status,
    storage_path: storagePath,
    alt: parsed.alt,
    aspect: parsed.aspect,
    captured_at: parsed.capturedAt ?? null,
    location: parsed.location ?? null,
    featured: parsed.featured,
    pinned: parsed.pinned,
    sort_order: parsed.sortOrder,
  });
  if (error) {
    if (storagePath) await deleteGalleryImage(storagePath);
    throw new Error(error.message);
  }

  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
  redirect(`/admin/gallery/${collectionSlug}`);
}

export async function updateItemAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const parsed = itemSchema.parse({
    collectionId: pickField(formData, "collectionId"),
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    caption: pickField(formData, "caption"),
    type: pickField(formData, "type") || "image",
    status: pickField(formData, "status") || "placeholder",
    alt: pickField(formData, "alt"),
    aspect: pickField(formData, "aspect") || "4/5",
    capturedAt: pickField(formData, "capturedAt") || undefined,
    location: pickField(formData, "location") || undefined,
    featured: booleanField(formData, "featured"),
    pinned: booleanField(formData, "pinned"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("gallery_items")
    .update({
      slug: parsed.slug,
      title: parsed.title,
      caption: parsed.caption,
      type: parsed.type,
      status: parsed.status,
      alt: parsed.alt,
      aspect: parsed.aspect,
      captured_at: parsed.capturedAt ?? null,
      location: parsed.location ?? null,
      featured: parsed.featured,
      pinned: parsed.pinned,
      sort_order: parsed.sortOrder,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
}

export async function deleteItemAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  // Pull storage path before deleting the row so we can clean up
  // the bucket. Cascade only handles DB rows.
  const { data: itemRow } = await supabase
    .from("gallery_items")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  const storagePath = itemRow?.storage_path as string | null | undefined;

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (storagePath) await deleteGalleryImage(storagePath);

  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
}
