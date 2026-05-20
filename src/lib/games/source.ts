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
  if (rows.length === 0) return games;
  return rows.map(dbGameRowToGame);
});

export const getGameFromSource = cache(
  async (slug: string): Promise<Game | undefined> => {
    const all = await getGamesSource();
    return all.find((g) => g.slug === slug);
  },
);
