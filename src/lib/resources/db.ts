import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Resource } from "@/content/schemas";

// DB-backed resources reads. Wrapped in React cache() so multiple
// callers per render hit Supabase once. All return arrays — never
// null — so callers can fall back cleanly to src/content/resources.ts
// when the table is empty.

export interface DbResourceRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  why: string;
  type: Resource["type"];
  link: string;
  pricing: string;
  tags: string[];
  status: Resource["status"];
  featured: boolean;
  icon_key: string | null;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, name, category, description, why, type, link, pricing, tags, status, featured, icon_key, sort_order";

// `createSupabaseServerClient` reads request cookies, which throws
// when Next is enumerating `generateStaticParams` /
// `generateImageMetadata` / `sitemap` at build time (no request
// context). We try/catch around the cookies-using setup and fall
// back to an empty result — `getResourcesSource` then returns the
// static `resources` array, which is the intended build-time
// behaviour until the resources table is the source of truth.
export const getDbResources = cache(async (): Promise<DbResourceRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("resources")
      .select(SELECT_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DbResourceRow[];
  } catch {
    return [];
  }
});

export const getDbResourceBySlug = cache(
  async (slug: string): Promise<DbResourceRow | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("resources")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as DbResourceRow;
    } catch {
      return null;
    }
  },
);

// Map a DB row to the Resource shape consumed by /resources and its
// tools/links sub-pages. `icon_key` is nullable in the DB; the schema
// treats `iconKey` as an optional string, so a null row collapses to
// undefined.
export function dbResourceRowToResource(row: DbResourceRow): Resource {
  return {
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    why: row.why,
    type: row.type,
    link: row.link,
    pricing: row.pricing,
    tags: row.tags ?? [],
    status: row.status,
    featured: row.featured,
    iconKey: row.icon_key ?? undefined,
  };
}
