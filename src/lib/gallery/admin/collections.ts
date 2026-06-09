"use server";

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
  COLLECTION_COLUMNS,
  STATUS_ENUM,
  collectionSchema,
  collectionToRow,
  parseCollection,
  pickField,
  revalidateGallery,
} from "./shared";

// Collection server actions for the gallery CMS. Collections are a
// standard CRUD domain (mirrors the games template). requireAdmin gates
// every entry point; RLS on the underlying tables is the
// belt-and-suspenders layer. create/update return an AdminActionState so
// the form shows inline feedback instead of throwing; the lightweight
// status/reorder/duplicate actions power the list UI.

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
