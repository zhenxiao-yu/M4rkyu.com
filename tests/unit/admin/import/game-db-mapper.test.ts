import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" } }));

describe("dbGameRowToGame with screenshots", () => {
  it("prepends cover and maps screenshot rows (passthrough /public path)", async () => {
    const { dbGameRowToGame } = await import("@/lib/games/db");
    const row = {
      id: "g1", slug: "descent", title: "Descent", engine: "Unity", year: "2024",
      status: "ready", pitch: "p", role: "r", notes: [], cover_src: "/project-covers/descent.webp",
      cover_alt: "cover", trailer_url: null, platforms: [], pillars: [], postmortem: null,
      outcome: null, build_links: null, sort_order: 0,
    };
    const shots = [{ id: "s1", game_id: "g1", path: "/project-covers/descent-dungeon.webp", alt: "dungeon", label: "Dungeon", caption: "cap", width: 1600, height: 895, sort_order: 0 }];
    const game = dbGameRowToGame(row as never, shots as never);
    expect(game.cover?.src).toBe("/project-covers/descent.webp");
    expect(game.screenshots).toHaveLength(1);
    expect(game.screenshots[0]).toMatchObject({ src: "/project-covers/descent-dungeon.webp", alt: "dungeon", label: "Dungeon", caption: "cap" });
  });
});
