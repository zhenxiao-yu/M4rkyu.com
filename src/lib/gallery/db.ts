import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseReadClient } from "@/lib/supabase/read";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { env } from "@/lib/env";

// DB-backed gallery reads. Wrapped in React `cache()` so multiple
// callers per render (page + sitemap + metadata) hit Supabase once.
// All return arrays — never null — so callers can fall back cleanly
// to src/content/gallery.ts when the table is empty.

export interface DbCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverPath: string | null;
  coverAlt: string;
  status: "ready" | "draft" | "placeholder" | "coming-soon";
  sortOrder: number;
  featured: boolean;
  mood: string[];
}

export interface DbItem {
  id: string;
  collectionId: string;
  collectionSlug: string;
  slug: string;
  title: string;
  caption: string;
  type: "image" | "contact-sheet" | "process";
  status: "ready" | "draft" | "placeholder" | "coming-soon";
  storagePath: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  aspect: "1/1" | "4/5" | "3/4" | "2/3" | "16/9" | "21/9";
  capturedAt: string | null;
  location: string | null;
  mood: string[];
  tags: string[];
  featured: boolean;
  pinned: boolean;
  sortOrder: number;
}

// Resolve a Supabase storage path to a CDN URL. Public bucket so no
// signed URL is needed; `next/image` consumes this directly.
export function storageUrlFor(path: string | null): string | null {
  if (!path) return null;
  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/gallery-images/${path}`;
}

interface CollectionRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  cover_alt: string | null;
  status: DbCollection["status"];
  sort_order: number;
  featured: boolean;
  mood: string[] | null;
}

interface ItemRow {
  id: string;
  collection_id: string;
  slug: string;
  title: string;
  caption: string | null;
  type: DbItem["type"];
  status: DbItem["status"];
  storage_path: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  blur_data_url: string | null;
  aspect: DbItem["aspect"];
  captured_at: string | null;
  location: string | null;
  mood: string[] | null;
  tags: string[] | null;
  featured: boolean;
  pinned: boolean;
  sort_order: number;
}

function rowToCollection(row: CollectionRow): DbCollection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    coverPath: row.cover_path,
    coverAlt: row.cover_alt ?? "",
    status: row.status,
    sortOrder: row.sort_order,
    featured: row.featured,
    mood: row.mood ?? [],
  };
}

function rowToItem(row: ItemRow, collectionSlug: string): DbItem {
  return {
    id: row.id,
    collectionId: row.collection_id,
    collectionSlug,
    slug: row.slug,
    title: row.title,
    caption: row.caption ?? "",
    type: row.type,
    status: row.status,
    storagePath: row.storage_path,
    alt: row.alt ?? "",
    width: row.width,
    height: row.height,
    blurDataUrl: row.blur_data_url,
    aspect: row.aspect,
    capturedAt: row.captured_at,
    location: row.location,
    mood: row.mood ?? [],
    tags: row.tags ?? [],
    featured: row.featured,
    pinned: row.pinned,
    sortOrder: row.sort_order,
  };
}

export const getDbGalleryCollections = cache(
  async (): Promise<DbCollection[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("gallery_collections")
      .select(
        "id, slug, title, description, cover_path, cover_alt, status, sort_order, featured, mood",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as CollectionRow[]).map(rowToCollection);
  },
);

export const getDbGalleryItems = cache(async (): Promise<DbItem[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select(
      "id, collection_id, slug, title, caption, type, status, storage_path, alt, width, height, blur_data_url, aspect, captured_at, location, mood, tags, featured, pinned, sort_order, collection:gallery_collections(slug)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (
    data as (ItemRow & { collection: { slug: string } | { slug: string }[] | null })[]
  ).map((row) => {
    // Supabase joins return either an array (when the relation isn't
    // unique) or an object. We declared a 1:1 FK so it's the latter,
    // but the type allows both.
    const collectionSlug = Array.isArray(row.collection)
      ? row.collection[0]?.slug
      : row.collection?.slug;
    return rowToItem(row, collectionSlug ?? "");
  });
});

export const getDbCollectionBySlug = cache(
  async (slug: string): Promise<DbCollection | null> => {
    if (!isSupabaseConfigured()) return null;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("gallery_collections")
      .select(
        "id, slug, title, description, cover_path, cover_alt, status, sort_order, featured, mood",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return rowToCollection(data as CollectionRow);
  },
);

// Cookieless public twins of the reads above. These use the anon read
// client (no `cookies()`), so the public /archive surface can be
// statically rendered / ISR instead of forced dynamic. Gallery RLS
// (`status = 'ready' OR is_admin`) means an anon read returns ONLY ready
// rows — correct for the public archive — while the cookie-bound reads
// above stay for admin (which must see drafts).
export const getPublicDbGalleryCollections = cache(
  async (): Promise<DbCollection[]> => {
    const supabase = createSupabaseReadClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("gallery_collections")
      .select(
        "id, slug, title, description, cover_path, cover_alt, status, sort_order, featured, mood",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as CollectionRow[]).map(rowToCollection);
  },
);

export const getPublicDbGalleryItems = cache(async (): Promise<DbItem[]> => {
  const supabase = createSupabaseReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gallery_items")
    .select(
      "id, collection_id, slug, title, caption, type, status, storage_path, alt, width, height, blur_data_url, aspect, captured_at, location, mood, tags, featured, pinned, sort_order, collection:gallery_collections(slug)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (
    data as (ItemRow & { collection: { slug: string } | { slug: string }[] | null })[]
  ).map((row) => {
    const collectionSlug = Array.isArray(row.collection)
      ? row.collection[0]?.slug
      : row.collection?.slug;
    return rowToItem(row, collectionSlug ?? "");
  });
});

export const getPublicDbCollectionBySlug = cache(
  async (slug: string): Promise<DbCollection | null> => {
    const supabase = createSupabaseReadClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("gallery_collections")
      .select(
        "id, slug, title, description, cover_path, cover_alt, status, sort_order, featured, mood",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return rowToCollection(data as CollectionRow);
  },
);
