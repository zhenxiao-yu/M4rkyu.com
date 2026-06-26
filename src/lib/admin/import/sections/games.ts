import "server-only";

import { games } from "@/content/games";
import type { Game } from "@/content/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { insertNewBySlug } from "../insert-new";
import type { ImportReport } from "../types";

export function staticGameToRow(g: Game): Record<string, unknown> {
  return {
    slug: g.slug,
    title: g.title,
    engine: g.engine,
    year: g.year,
    status: "draft", // imported games are never auto-published
    pitch: g.pitch,
    role: g.role,
    notes: g.notes,
    cover_src: g.cover?.src ?? null,
    cover_alt: g.cover?.alt ?? "",
    trailer_url: g.trailerUrl ?? null,
    platforms: g.platforms,
    pillars: g.pillars,
    postmortem: g.postmortem ?? "",
    outcome: g.outcome ?? "",
    build_links: g.buildLinks,
    sort_order: 0,
  };
}

export function staticGameScreenshotRows(
  g: Game,
  gameId: string,
): Record<string, unknown>[] {
  return g.screenshots.map((shot, index) => ({
    game_id: gameId,
    path: shot.src,
    alt: shot.alt ?? "",
    label: shot.label ?? "",
    caption: shot.caption ?? "",
    width: shot.width ?? null,
    height: shot.height ?? null,
    sort_order: index,
  }));
}

export async function importGames(dryRun: boolean): Promise<ImportReport> {
  const supabase = await createSupabaseServerClient();
  const result = await insertNewBySlug(
    supabase,
    "games",
    games,
    (g) => g.slug,
    staticGameToRow,
    dryRun,
  );

  if (!dryRun && result.insertedRows.length > 0) {
    const bySlug = new Map(games.map((g) => [g.slug, g]));
    const shotRows = result.insertedRows.flatMap(({ id, slug }) => {
      const g = bySlug.get(slug);
      return g ? staticGameScreenshotRows(g, id) : [];
    });
    if (shotRows.length > 0) {
      const { error } = await supabase.from("game_screenshots").insert(shotRows);
      if (error) throw new Error(error.message);
    }
  }

  return {
    section: "games",
    totalStatic: games.length,
    inserted: result.inserted,
    skipped: result.skippedSlugs.length,
    skippedSlugs: result.skippedSlugs,
  };
}
