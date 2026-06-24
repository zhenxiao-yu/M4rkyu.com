import "server-only";

import { cache } from "react";
import { galleryCollections, galleryItems } from "@/content/gallery";
import {
  getPublicDbGalleryCollections,
  getPublicDbGalleryItems,
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
    getPublicDbGalleryCollections(),
    getPublicDbGalleryItems(),
  ]);

  if (dbCollections.length === 0) {
    // Public surfaces show only ready content — placeholders/drafts/coming-soon
    // stay out of /archive (mirrors the games + shop sources, and the DB branch
    // below). Until real frames land, the static fallback is empty and the page
    // renders its honest empty-state instead of leaking internal placeholders.
    return {
      collections: galleryCollections.filter((c) => c.status === "ready"),
      items: galleryItems.filter((item) => item.status === "ready"),
    };
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

// Trim DB-authored display strings — admin input occasionally carries trailing
// whitespace (e.g. "Chengdu ") that would otherwise surface in titles, map
// labels, and ARIA. Applied at the read boundary so every consumer is clean.
const clean = (value: string | null | undefined): string => (value ?? "").trim();

function dbCollectionToGalleryCollection(
  row: DbCollection,
  itemCount: number,
): GalleryCollection {
  const title = clean(row.title);
  return {
    title,
    slug: row.slug,
    description: clean(row.description) || title,
    cover: {
      src: storageUrlFor(row.coverPath) ?? `/gallery/${row.slug}.svg`,
      alt: clean(row.coverAlt) || `${title} cover`,
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
  const title = clean(row.title);
  return {
    title,
    slug: row.slug,
    collection: row.collectionSlug,
    type: row.type,
    status: row.status,
    caption: clean(row.caption) || title,
    src: src
      ? {
          src,
          alt: clean(row.alt) || title,
          width: row.width ?? undefined,
          height: row.height ?? undefined,
          blurDataURL: row.blurDataUrl ?? undefined,
        }
      : undefined,
    aspect: row.aspect,
    capturedAt: row.capturedAt ?? undefined,
    location: clean(row.location) || undefined,
    tags: row.tags,
    mood: row.mood,
    featured: row.featured,
    pinned: row.pinned,
    related: [],
  };
}
