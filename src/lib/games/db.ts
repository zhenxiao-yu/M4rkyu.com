import "server-only";

import { cache } from "react";
import { createSupabaseReadClient } from "@/lib/supabase/read";
import type { Game } from "@/content/schemas";

// DB-backed games reads. Wrapped in React cache() so multiple
// callers per render hit Supabase once. All return arrays — never
// null — so callers can fall back cleanly to src/content/games.ts
// when the table is empty.

export interface DbGameRow {
  id: string;
  slug: string;
  title: string;
  engine: string;
  year: string;
  status: Game["status"];
  pitch: string;
  role: string;
  notes: string[];
  cover_src: string | null;
  cover_alt: string | null;
  trailer_url: string | null;
  platforms: string[];
  pillars: string[];
  postmortem: string | null;
  outcome: string | null;
  build_links: { label: string; url: string }[] | null;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, title, engine, year, status, pitch, role, notes, cover_src, cover_alt, trailer_url, platforms, pillars, postmortem, outcome, build_links, sort_order";

// `createSupabaseServerClient` reads request cookies, which throws
// when Next is enumerating `generateStaticParams` /
// `generateImageMetadata` / `sitemap` at build time (no request
// context). We try/catch around the cookies-using setup and fall
// back to an empty result — `getGamesSource` then returns the
// static `games` array, which is the intended build-time
// behaviour until the games table is the source of truth.
export const getDbGames = cache(async (): Promise<DbGameRow[]> => {
  const supabase = createSupabaseReadClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("games")
      .select(SELECT_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DbGameRow[];
  } catch {
    return [];
  }
});

export const getDbGameBySlug = cache(
  async (slug: string): Promise<DbGameRow | null> => {
    const supabase = createSupabaseReadClient();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("games")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as DbGameRow;
    } catch {
      return null;
    }
  },
);

// Map a DB row to the Game shape consumed by /games and /games/[slug].
// `translations` lives only in static content for now, so we leave it
// undefined — the existing components fall back to the base fields.
export function dbGameRowToGame(row: DbGameRow): Game {
  return {
    title: row.title,
    slug: row.slug,
    engine: row.engine,
    year: row.year,
    status: row.status,
    pitch: row.pitch,
    role: row.role,
    notes: row.notes ?? [],
    cover: row.cover_src
      ? { src: row.cover_src, alt: row.cover_alt || row.title }
      : undefined,
    screenshots: [],
    decisions: [],
    trailerUrl: row.trailer_url ?? undefined,
    platforms: row.platforms ?? [],
    pillars: row.pillars ?? [],
    postmortem: row.postmortem ?? undefined,
    outcome: row.outcome ?? undefined,
    buildLinks: row.build_links ?? [],
    translations: undefined,
  };
}
