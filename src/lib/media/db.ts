import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { MediaItem } from "@/content/schemas";

// DB-backed media reads. Wrapped in React cache() so multiple
// callers per render hit Supabase once. All return arrays — never
// null — so callers can fall back cleanly to src/content/media.ts
// when the table is empty.

export interface DbMediaRow {
  id: string;
  slug: string;
  title: string;
  format: MediaItem["format"];
  status: MediaItem["status"];
  description: string;
  duration: string | null;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, title, format, status, description, duration, sort_order";

// `createSupabaseServerClient` reads request cookies, which throws
// when Next is enumerating `generateStaticParams` /
// `generateImageMetadata` / `sitemap` at build time (no request
// context). We try/catch around the cookies-using setup and fall
// back to an empty result — `getMediaSource` then returns the
// static `mediaItems` array, which is the intended build-time
// behaviour until the media table is the source of truth.
export const getDbMediaItems = cache(async (): Promise<DbMediaRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("media_items")
      .select(SELECT_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DbMediaRow[];
  } catch {
    return [];
  }
});

export const getDbMediaBySlug = cache(
  async (slug: string): Promise<DbMediaRow | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("media_items")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as DbMediaRow;
    } catch {
      return null;
    }
  },
);

// Map a DB row to the MediaItem shape consumed by /media.
// duration is nullable in the DB but optional in the schema.
export function dbMediaRowToItem(row: DbMediaRow): MediaItem {
  return {
    title: row.title,
    slug: row.slug,
    format: row.format,
    status: row.status,
    description: row.description,
    duration: row.duration ?? undefined,
  };
}
