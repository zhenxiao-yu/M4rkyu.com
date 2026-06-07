"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
  dbErrorToMessage,
  zodToActionState,
} from "@/lib/admin/action-state";
import {
  uploadGalleryImage,
  deleteGalleryImage,
} from "@/lib/gallery/storage";

// Admin server actions for the gallery CMS. Collections are a standard
// CRUD domain (mirrors the games template); items are bespoke because
// they carry an image upload. requireAdmin gates every entry point;
// RLS on the underlying tables is the belt-and-suspenders layer.
// create/update return an AdminActionState so the form shows inline
// feedback instead of throwing; the lightweight status/reorder/
// duplicate actions power the list UI.

const SLUG_RE = /^[a-z0-9-]+$/;
const STATUS_ENUM = z.enum(["ready", "draft", "placeholder", "coming-soon"]);
const ITEM_TYPE_ENUM = z.enum(["image", "contact-sheet", "process"]);
const ASPECT_ENUM = z.enum(["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"]);

const collectionSchema = z.object({
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(80),
  title: z.string().min(1).max(120),
  description: z.string().max(600).default(""),
  status: STATUS_ENUM.default("draft"),
  sortOrder: z.coerce.number().int().default(0),
  featured: z.coerce.boolean().default(false),
  coverAlt: z.string().max(240).default(""),
});

const itemSchema = z.object({
  collectionId: z.string().uuid(),
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(100),
  title: z.string().min(1).max(160),
  caption: z.string().max(1000).default(""),
  type: ITEM_TYPE_ENUM.default("image"),
  status: STATUS_ENUM.default("draft"),
  alt: z.string().max(240).default(""),
  aspect: ASPECT_ENUM.default("4/5"),
  capturedAt: z.string().optional(),
  location: z.string().optional(),
  featured: z.coerce.boolean().default(false),
  pinned: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  width: z.coerce.number().int().positive().max(60000).optional(),
  height: z.coerce.number().int().positive().max(60000).optional(),
  blurDataUrl: z.string().max(20000).optional(),
});

const COLLECTION_COLUMNS =
  "slug, title, description, status, sort_order, featured, cover_path, cover_alt, mood";

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function booleanField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function parseCollection(formData: FormData) {
  return collectionSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    description: pickField(formData, "description"),
    status: pickField(formData, "status") || "draft",
    sortOrder: pickField(formData, "sortOrder") || "0",
    featured: booleanField(formData, "featured"),
    coverAlt: pickField(formData, "coverAlt"),
  });
}

function collectionToRow(parsed: z.infer<typeof collectionSchema>) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    description: parsed.description,
    status: parsed.status,
    sort_order: parsed.sortOrder,
    featured: parsed.featured,
    cover_alt: parsed.coverAlt || null,
  };
}

function parseItem(formData: FormData) {
  return itemSchema.parse({
    collectionId: pickField(formData, "collectionId"),
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    caption: pickField(formData, "caption"),
    type: pickField(formData, "type") || "image",
    status: pickField(formData, "status") || "draft",
    alt: pickField(formData, "alt"),
    aspect: pickField(formData, "aspect") || "4/5",
    capturedAt: pickField(formData, "capturedAt") || undefined,
    location: pickField(formData, "location") || undefined,
    featured: booleanField(formData, "featured"),
    pinned: booleanField(formData, "pinned"),
    sortOrder: pickField(formData, "sortOrder") || "0",
    width: pickField(formData, "width") || undefined,
    height: pickField(formData, "height") || undefined,
    blurDataUrl: pickField(formData, "blurDataUrl") || undefined,
  });
}

function revalidateGallery(slug?: string) {
  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
  if (slug) revalidatePath(`/(.*)/archive/${slug}`, "page");
}

// ── Collections ────────────────────────────────────────────────────

export async function createCollectionAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof collectionSchema>;
  try {
    parsed = parseCollection(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("gallery_collections")
    .insert(collectionToRow(parsed));
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateGallery(parsed.slug);
  redirect(`/admin/gallery/${parsed.slug}`);
}

export async function updateCollectionAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof collectionSchema>;
  try {
    parsed = parseCollection(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("gallery_collections")
    .update(collectionToRow(parsed))
    .eq("id", id);
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateGallery(parsed.slug);
  return adminSuccess();
}

export async function deleteCollectionAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  // Pull child items first so we can clean up storage objects. The FK
  // cascade deletes the rows; storage objects orphan unless we remove
  // them here.
  const { data: items } = await supabase
    .from("gallery_items")
    .select("storage_path")
    .eq("collection_id", id);
  const paths = (items ?? [])
    .map((row) => (row as { storage_path: string | null }).storage_path)
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    await supabase.storage.from("gallery-images").remove(paths);
  }

  const { error } = await supabase
    .from("gallery_collections")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateGallery();
  redirect("/admin/gallery");
}

export async function setCollectionStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = STATUS_ENUM.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gallery_collections")
    .update({ status: parsed.data })
    .eq("id", id);
  revalidateGallery();
}

export async function reorderCollectionAction(
  id: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gallery_collections")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  // Normalize sort_order to the new positions; only write what changed.
  await Promise.all(
    rows
      .map((row, position) => ({ row, position }))
      .filter(({ row, position }) => row.sort_order !== position)
      .map(({ row, position }) =>
        supabase
          .from("gallery_collections")
          .update({ sort_order: position })
          .eq("id", row.id),
      ),
  );
  revalidateGallery();
}

export async function duplicateCollectionAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gallery_collections")
    .select(COLLECTION_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & {
    slug: string;
    title: string;
  };

  // Find a free `<slug>-copy[-n]` slug.
  let slug = `${source.slug}-copy`.slice(0, 80);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("gallery_collections")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 80);
    if (n > 50) return;
  }

  // Metadata-only copy — does NOT clone items.
  const { error } = await supabase.from("gallery_collections").insert({
    ...source,
    slug,
    title: `${source.title} (copy)`,
    status: "draft",
  });
  if (error) return;
  revalidateGallery();
  redirect(`/admin/gallery/${slug}`);
}

// ── Items ──────────────────────────────────────────────────────────

export async function createItemAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof itemSchema>;
  try {
    parsed = parseItem(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  // Resolve the collection slug for the storage path prefix + revalidate.
  const supabase = await createSupabaseServerClient();
  const { data: collectionRow } = await supabase
    .from("gallery_collections")
    .select("slug")
    .eq("id", parsed.collectionId)
    .maybeSingle();
  const collectionSlug =
    (collectionRow?.slug as string | undefined) ?? "misc";

  let storagePath: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadGalleryImage(
      file,
      `${collectionSlug}/${parsed.slug}`,
    );
    if (!upload) return adminError(dbErrorToMessage("upload failed"), { image: " " });
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
    width: storagePath ? (parsed.width ?? null) : null,
    height: storagePath ? (parsed.height ?? null) : null,
    blur_data_url: storagePath ? (parsed.blurDataUrl ?? null) : null,
    aspect: parsed.aspect,
    captured_at: parsed.capturedAt ?? null,
    location: parsed.location ?? null,
    featured: parsed.featured,
    pinned: parsed.pinned,
    sort_order: parsed.sortOrder,
  });
  if (error) {
    if (storagePath) await deleteGalleryImage(storagePath);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  revalidateGallery(collectionSlug);
  return adminSuccess();
}

export async function updateItemAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof itemSchema>;
  try {
    parsed = parseItem(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = {
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
  };

  // Optional image replacement. Only touch storage when a new file is
  // actually supplied; otherwise the existing image is left untouched.
  let oldPath: string | null = null;
  let newPath: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const { data: itemRow } = await supabase
      .from("gallery_items")
      .select("storage_path, collection:gallery_collections(slug)")
      .eq("id", id)
      .maybeSingle();
    oldPath =
      (itemRow as { storage_path: string | null } | null)?.storage_path ??
      null;
    const rel = (itemRow as { collection: { slug: string } | null } | null)
      ?.collection;
    const collectionSlug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;

    const upload = await uploadGalleryImage(
      file,
      `${collectionSlug ?? "misc"}/${parsed.slug}`,
    );
    if (!upload) return adminError(dbErrorToMessage("upload failed"), { image: " " });
    newPath = upload.path;
    updates.storage_path = newPath;
    updates.width = parsed.width ?? null;
    updates.height = parsed.height ?? null;
    updates.blur_data_url = parsed.blurDataUrl ?? null;
  }

  const { error } = await supabase
    .from("gallery_items")
    .update(updates)
    .eq("id", id);
  if (error) {
    // Roll back the just-uploaded object so a failed update doesn't orphan it.
    if (newPath) await deleteGalleryImage(newPath);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  // Update committed — now safe to drop the superseded object.
  if (newPath && oldPath && oldPath !== newPath) {
    await deleteGalleryImage(oldPath);
  }

  revalidateGallery();
  return adminSuccess();
}

export async function deleteItemAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  // Pull storage path before deleting the row so we can clean up the
  // bucket. Cascade only handles DB rows.
  const { data: itemRow } = await supabase
    .from("gallery_items")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  const storagePath = itemRow?.storage_path as string | null | undefined;

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (storagePath) await deleteGalleryImage(storagePath);

  revalidateGallery();
}

export async function setItemStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = STATUS_ENUM.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gallery_items")
    .update({ status: parsed.data })
    .eq("id", id);
  revalidateGallery();
}

export async function setItemFeaturedAction(id: string, featured: boolean) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gallery_items")
    .update({ featured: Boolean(featured) })
    .eq("id", id);
  revalidateGallery();
}

// Single-step reorder scoped to the item's own collection (mirrors
// reorderCollectionAction). The grid replays this |delta| times for a drag.
export async function reorderItemAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: itemRow } = await supabase
    .from("gallery_items")
    .select("collection_id")
    .eq("id", id)
    .maybeSingle();
  const collectionId = (itemRow as { collection_id: string } | null)
    ?.collection_id;
  if (!collectionId) return;

  const { data } = await supabase
    .from("gallery_items")
    .select("id, sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await Promise.all(
    rows
      .map((row, position) => ({ row, position }))
      .filter(({ row, position }) => row.sort_order !== position)
      .map(({ row, position }) =>
        supabase
          .from("gallery_items")
          .update({ sort_order: position })
          .eq("id", row.id),
      ),
  );
  revalidateGallery();
}

export async function bulkSetItemStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = STATUS_ENUM.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gallery_items")
    .update({ status: parsed.data })
    .in("id", ids);
  revalidateGallery();
}

export async function bulkDeleteItemsAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  // Collect storage paths before the cascade so the bucket doesn't orphan.
  const { data } = await supabase
    .from("gallery_items")
    .select("storage_path")
    .in("id", ids);
  const paths = (data ?? [])
    .map((row) => (row as { storage_path: string | null }).storage_path)
    .filter((p): p is string => Boolean(p));

  const { error } = await supabase.from("gallery_items").delete().in("id", ids);
  if (error) throw new Error(error.message);
  if (paths.length > 0) {
    await supabase.storage.from("gallery-images").remove(paths);
  }
  revalidateGallery();
}

// Batch insert for the drag-a-folder uploader. The browser uploads the
// (optimized) files straight to storage — bypassing the server-action body
// limit — then hands us the resulting paths + metadata to row-insert in one
// shot. Slugs are de-collided against the collection's existing items.
const batchItemSchema = z.object({
  path: z.string().min(1).max(300),
  slug: z.string().regex(SLUG_RE).min(1).max(100),
  title: z.string().min(1).max(160),
  width: z.coerce.number().int().positive().max(60000).optional(),
  height: z.coerce.number().int().positive().max(60000).optional(),
  blurDataUrl: z.string().max(20000).optional(),
  aspect: ASPECT_ENUM.optional(),
  capturedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function createGalleryItemsBatchAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const collectionId = pickField(formData, "collectionId");
  if (!z.string().uuid().safeParse(collectionId).success) {
    return adminError("Missing collection.");
  }

  let payload: z.infer<typeof batchItemSchema>[];
  try {
    payload = z
      .array(batchItemSchema)
      .min(1)
      .max(100)
      .parse(JSON.parse(pickField(formData, "items") || "[]"));
  } catch {
    return adminError("Nothing to upload.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: col } = await supabase
    .from("gallery_collections")
    .select("slug")
    .eq("id", collectionId)
    .maybeSingle();
  const collectionSlug = (col as { slug: string } | null)?.slug;
  if (!collectionSlug) return adminError("Collection not found.");

  const { data: existing } = await supabase
    .from("gallery_items")
    .select("slug, sort_order")
    .eq("collection_id", collectionId);
  const existingRows = (existing ?? []) as {
    slug: string;
    sort_order: number;
  }[];
  const taken = new Set(existingRows.map((r) => r.slug));
  let nextSort =
    existingRows.reduce((max, r) => Math.max(max, r.sort_order), -1) + 1;

  const uniqueSlug = (base: string): string => {
    let slug = base;
    for (let n = 2; taken.has(slug) && n < 500; n += 1) {
      slug = `${base}-${n}`.slice(0, 100);
    }
    taken.add(slug);
    return slug;
  };

  const rows = payload.map((it) => ({
    collection_id: collectionId,
    slug: uniqueSlug(it.slug),
    title: it.title,
    caption: "",
    type: "image",
    status: "draft",
    storage_path: it.path,
    alt: "",
    width: it.width ?? null,
    height: it.height ?? null,
    blur_data_url: it.blurDataUrl ?? null,
    aspect: it.aspect ?? "4/5",
    captured_at: it.capturedAt ?? null,
    location: null,
    featured: false,
    pinned: false,
    sort_order: nextSort++,
  }));

  const { error } = await supabase.from("gallery_items").insert(rows);
  if (error) {
    // A failed insert would orphan the just-uploaded objects — clean them up.
    await supabase.storage
      .from("gallery-images")
      .remove(payload.map((p) => p.path));
    return adminError(dbErrorToMessage(error.message));
  }

  revalidateGallery(collectionSlug);
  return adminSuccess();
}

// The organize core — reassign items to another collection. The storage
// object keeps its original path (just a key; the public URL still
// resolves), so this is a pure metadata move.
export async function moveItemsAction(ids: string[], targetCollectionId: string) {
  await requireAdmin();
  if (ids.length === 0) return;
  if (!z.string().uuid().safeParse(targetCollectionId).success) return;
  const supabase = await createSupabaseServerClient();
  const { data: target } = await supabase
    .from("gallery_collections")
    .select("id")
    .eq("id", targetCollectionId)
    .maybeSingle();
  if (!target) return;
  await supabase
    .from("gallery_items")
    .update({ collection_id: targetCollectionId })
    .in("id", ids);
  revalidateGallery();
}
