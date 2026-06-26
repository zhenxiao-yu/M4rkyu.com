import { describe, it, expect } from "vitest";
import { staticGameToRow, staticGameScreenshotRows } from "@/lib/admin/import/sections/games";
import type { Game } from "@/content/schemas";

const g = {
  title: "Descent", slug: "descent", engine: "Unity", year: "2024", status: "ready",
  pitch: "p", role: "r", notes: ["n"],
  cover: { src: "/project-covers/descent.webp", alt: "cover" },
  screenshots: [{ src: "/project-covers/descent-dungeon.webp", alt: "dungeon", label: "L", caption: "C", width: 1600, height: 895 }],
  decisions: [], platforms: ["PC"], pillars: [], buildLinks: [],
} as unknown as Game;

describe("games import mappers", () => {
  it("maps to a games row, forces draft, stores cover_src", () => {
    const row = staticGameToRow(g);
    expect(row.slug).toBe("descent");
    expect(row.status).toBe("draft");
    expect(row.cover_src).toBe("/project-covers/descent.webp");
    expect(row.cover_alt).toBe("cover");
    expect(row.notes).toEqual(["n"]);
    expect(row.build_links).toEqual([]);
  });

  it("maps every screenshot to a game_screenshots row", () => {
    const rows = staticGameScreenshotRows(g, "g1");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ game_id: "g1", path: "/project-covers/descent-dungeon.webp", alt: "dungeon", sort_order: 0 });
  });
});
