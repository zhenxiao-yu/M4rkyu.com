import "server-only";

import { cache } from "react";
import { galleryCollections, galleryItems } from "@/content/gallery";
import {
  getDbGalleryCollections,
  getDbGalleryItems,
  storageUrlFor,
  type DbCollection,
  type DbItem,
} from "@/lib/gallery/db";
import type { GalleryCollection, GalleryItem } from "@/content/schemas";

// Unified read of gallery data — DB first, static src/content/gallery.ts
// as zero-downtime fallback. Public surfaces (/archive, sitemap)
// consume the merged shape and never see the underlying source.
//
// Cutover behavior: as soon as the gallery_collections table has ≥1
// row, the public surface flips to DB-backed reads. If the table is
// empty (fresh install, migration not applied) the static array
// remains the authoritative source so the page never goes blank.

export interface GallerySource {
  collections: GalleryCollection[];
  items: GalleryItem[];
}

export const getGallerySource = cache(async (): Promise<GallerySource> => {
  const [dbCollections, dbItems] = await Promise.all([
    getDbGalleryCollections(),
    getDbGalleryItems(),
  ]);

  if (dbCollections.length === 0) {
    return { collections: galleryCollections, items: galleryItems };
  }

  const itemsBySlug = new Map<string, GalleryItem[]>();
  for (const item of dbItems) {
    const slug = item.collectionSlug;
    if (!slug) continue;
    const list = itemsBySlug.get(slug) ?? [];
    list.push(dbItemToGalleryItem(item));
    itemsBySlug.set(slug, list);
  }

  // Only surface ready content publicly. Admin views go through the DB
  // layer directly and see every status.
  const collections = dbCollections
    .filter((c) => c.status === "ready")
    .map((c) =>
      dbCollectionToGalleryCollection(c, itemsBySlug.get(c.slug)?.length ?? 0),
    );
  const items = dbItems
    .filter((item) => item.status === "ready")
    .map(dbItemToGalleryItem);

  return { collections, items };
});

function dbCollectionToGalleryCollection(
  row: DbCollection,
  itemCount: number,
): GalleryCollection {
  return {
    title: row.title,
    slug: row.slug,
    description: row.description || row.title,
    cover: {
      src: storageUrlFor(row.coverPath) ?? `/gallery/${row.slug}.svg`,
      alt: row.coverAlt || `${row.title} cover`,
      focal: "center",
    },
    count: itemCount,
    status: row.status,
    mood: row.mood,
    featured: row.featured,
  };
}

function dbItemToGalleryItem(row: DbItem): GalleryItem {
  const src = storageUrlFor(row.storagePath);
  return {
    title: row.title,
    slug: row.slug,
    collection: row.collectionSlug,
    type: row.type,
    status: row.status,
    caption: row.caption || row.title,
    src: src ? { src, alt: row.alt || row.title } : undefined,
    aspect: row.aspect,
    capturedAt: row.capturedAt ?? undefined,
    location: row.location ?? undefined,
    tags: row.tags,
    mood: row.mood,
    featured: row.featured,
    pinned: row.pinned,
    related: [],
  };
}
