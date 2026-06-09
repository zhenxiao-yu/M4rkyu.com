"use server";

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
import {
  STATUS_ENUM,
  batchItemSchema,
  itemSchema,
  parseItem,
  pickField,
  revalidateGallery,
} from "./shared";

// Item server actions for the gallery CMS. Items are bespoke because they
// carry an image upload. requireAdmin gates every entry point; RLS on the
// underlying tables is the belt-and-suspenders layer.

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

export async function setItemAltAction(id: string, alt: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gallery_items")
    .update({ alt: (alt ?? "").slice(0, 240) })
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
