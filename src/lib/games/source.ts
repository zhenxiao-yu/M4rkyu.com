import "server-only";

import { cache } from "react";
import { games } from "@/content/games";
import { dbGameRowToGame, getDbGames } from "@/lib/games/db";
import type { Game } from "@/content/schemas";

// Unified read of games — DB first, static src/content/games.ts as
// zero-downtime fallback. Public surfaces (/games, /games/[slug])
// consume this and never see the underlying source.
//
// Cutover: as soon as the games table has ≥1 row, the public surface
// flips to DB-backed reads. Until then, the static array remains
// authoritative.

export const getGamesSource = cache(async (): Promise<Game[]> => {
  const rows = await getDbGames();
  const all = rows.length === 0 ? games : rows.map(dbGameRowToGame);
  // Public surfaces show only finished games — drafts/placeholders/coming-soon
  // stay out of /games (mirrors shop + gallery sources). Until a real game
  // ships, /games renders its empty state instead of internal placeholder copy.
  return all.filter((game) => game.status === "ready");
});

export const getGameFromSource = cache(
  async (slug: string): Promise<Game | undefined> => {
    const all = await getGamesSource();
    return all.find((g) => g.slug === slug);
  },
);
