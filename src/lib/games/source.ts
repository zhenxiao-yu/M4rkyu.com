import "server-only";

import { cache } from "react";
import { games } from "@/content/games";
import {
  dbGameRowToGame,
  getDbGames,
  getPublicScreenshotsByGame,
} from "@/lib/games/db";
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
  // Cold start only: an empty table serves the static case studies (ready
  // only) so the page never goes blank. Once seeded, the DB is the single
  // source of truth — static rows no longer leak through.
  if (rows.length === 0) {
    return games.filter((game) => game.status === "ready");
  }
  // Attach uploaded screenshots in one batched read (grouped by game id) so
  // the detail page has labeled shots without an N+1.
  const shotsByGame = await getPublicScreenshotsByGame(rows.map((row) => row.id));
  const dbGames = rows.map((row) =>
    dbGameRowToGame(row, shotsByGame.get(row.id) ?? []),
  );
  // Public surfaces show only finished case-study records. A `ready` record may
  // describe a shipped game, an archived prototype, or an active production
  // build; the page copy owns that distinction. Draft/placeholder/coming-soon
  // DB records remain private to the admin workflow.
  return dbGames.filter((game) => game.status === "ready");
});

export const getGameFromSource = cache(
  async (slug: string): Promise<Game | undefined> => {
    const all = await getGamesSource();
    return all.find((g) => g.slug === slug);
  },
);
