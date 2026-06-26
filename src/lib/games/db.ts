import "server-only";

import { cache } from "react";
import { createSupabaseReadClient } from "@/lib/supabase/read";
import { contentImageUrlFor } from "@/lib/content-images/storage";
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

export interface DbGameScreenshotRow {
  id: string;
  game_id: string;
  path: string;
  alt: string;
  label: string;
  caption: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}

const SCREENSHOT_COLUMNS =
  "id, game_id, path, alt, label, caption, width, height, sort_order";

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

// Batched read of every game's screenshots, grouped by game id, so the
// detail page renders uploaded shots without an N+1 (mirrors
// getPublicScreenshotsByProject). Returns an empty map on any error so
// callers degrade to a cover-only game.
export const getPublicScreenshotsByGame = cache(
  async (gameIds: string[]): Promise<Map<string, DbGameScreenshotRow[]>> => {
    const grouped = new Map<string, DbGameScreenshotRow[]>();
    if (gameIds.length === 0) return grouped;
    const supabase = createSupabaseReadClient();
    if (!supabase) return grouped;
    try {
      const { data, error } = await supabase
        .from("game_screenshots")
        .select(SCREENSHOT_COLUMNS)
        .in("game_id", gameIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error || !data) return grouped;
      for (const row of data as DbGameScreenshotRow[]) {
        const list = grouped.get(row.game_id) ?? [];
        list.push(row);
        grouped.set(row.game_id, list);
      }
      return grouped;
    } catch {
      return grouped;
    }
  },
);

// Map a screenshot row to the schema's image shape (resolves the
// content-images public URL, or passes through a /public path).
export function dbGameScreenshotRowToImage(row: DbGameScreenshotRow) {
  return {
    src: contentImageUrlFor(row.path) ?? "",
    alt: row.alt || row.label || "",
    label: row.label || undefined,
    caption: row.caption || undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
  };
}

// Map a DB row to the Game shape consumed by /games and /games/[slug].
// `translations` lives only in static content for now, so we leave it
// undefined — the existing components fall back to the base fields.
export function dbGameRowToGame(
  row: DbGameRow,
  screenshots: DbGameScreenshotRow[] = [],
): Game {
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
    screenshots: screenshots.map(dbGameScreenshotRowToImage),
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
