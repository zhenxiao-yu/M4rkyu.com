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
  const dbGames = rows.map(dbGameRowToGame);
  const publishedDbSlugs = new Set(
    dbGames.filter((game) => game.status === "ready").map((game) => game.slug),
  );
  const all = [
    ...dbGames,
    ...games.filter((game) => !publishedDbSlugs.has(game.slug)),
  ];
  // Public surfaces show only finished case-study records. A `ready` record may
  // describe a shipped game, an archived prototype, or an active production
  // build; the page copy owns that distinction. Draft/placeholder/coming-soon
  // DB records remain private to the admin workflow and do not erase a curated
  // static case study until a published DB version replaces the same slug.
  return all.filter((game) => game.status === "ready");
});

export const getGameFromSource = cache(
  async (slug: string): Promise<Game | undefined> => {
    const all = await getGamesSource();
    return all.find((g) => g.slug === slug);
  },
);
