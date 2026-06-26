import "server-only";

import { galleryCollections, galleryItems } from "@/content/gallery";
import type { GalleryCollection, GalleryItem } from "@/content/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { insertNewBySlug } from "../insert-new";
import type { ImportReport } from "../types";

export function staticCollectionToRow(c: GalleryCollection): Record<string, unknown> {
  return {
    slug: c.slug, title: c.title, description: c.description,
    cover_path: c.cover.src, cover_alt: c.cover.alt,
    status: c.status, featured: c.featured, mood: c.mood, sort_order: 0,
  };
}

export function staticItemToRow(i: GalleryItem, collectionId: string): Record<string, unknown> {
  return {
    collection_id: collectionId, slug: i.slug, title: i.title, caption: i.caption,
    type: i.type, status: i.status, storage_path: i.src?.src ?? null, alt: i.src?.alt ?? "",
    width: i.src?.width ?? null, height: i.src?.height ?? null, aspect: i.aspect,
    captured_at: i.capturedAt ?? null, location: i.location ?? null,
    mood: i.mood, tags: i.tags, featured: i.featured, pinned: i.pinned,
    blur_data_url: i.src?.blurDataURL ?? null, sort_order: 0,
  };
}

export async function importGallery(dryRun: boolean): Promise<ImportReport[]> {
  const supabase = await createSupabaseServerClient();

  const colResult = await insertNewBySlug(
    supabase, "gallery_collections", galleryCollections, (c) => c.slug, staticCollectionToRow, dryRun,
  );

  // Resolve every collection slug->id (newly inserted + already present) so
  // items can attach even on a re-run where collections already existed.
  const { data: allCols } = await supabase.from("gallery_collections").select("id, slug");
  const idBySlug = new Map(
    (allCols ?? []).map((r: { id: string; slug: string }) => [r.slug, r.id]),
  );

  const linkableItems = galleryItems.filter((i) => idBySlug.has(i.collection));
  const itemResult = await insertNewBySlug(
    supabase, "gallery_items", linkableItems, (i) => i.slug,
    (i) => staticItemToRow(i, idBySlug.get(i.collection) as string), dryRun,
  );

  return [
    {
      section: "gallery_collections",
      totalStatic: galleryCollections.length,
      inserted: colResult.inserted,
      skipped: colResult.skippedSlugs.length,
      skippedSlugs: colResult.skippedSlugs,
    },
    {
      section: "gallery_items",
      totalStatic: galleryItems.length,
      inserted: itemResult.inserted,
      skipped: itemResult.skippedSlugs.length,
      skippedSlugs: itemResult.skippedSlugs,
    },
  ];
}
