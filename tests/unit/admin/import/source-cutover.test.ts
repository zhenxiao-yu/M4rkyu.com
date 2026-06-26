import { describe, it, expect, vi, beforeEach } from "vitest";

// Static fixtures contain slug "static-only"; DB returns a different slug.
vi.mock("@/content/projects", () => ({
  allProjects: [{ slug: "static-only", title: "Static Only" }],
}));
vi.mock("@/content/games", () => ({
  games: [{ slug: "static-game", title: "Static Game", status: "ready" }],
}));

const dbProjects = vi.fn();
const dbScreens = vi.fn(async () => new Map());
vi.mock("@/lib/projects/db", () => ({
  getPublicDbProjects: () => dbProjects(),
  getPublicScreenshotsByProject: () => dbScreens(),
  dbProjectRowToProject: (row: { slug: string }) => ({ slug: row.slug, title: "DB " + row.slug }),
}));

const dbGames = vi.fn();
vi.mock("@/lib/games/db", () => ({
  getDbGames: () => dbGames(),
  getPublicScreenshotsByGame: async () => new Map(),
  dbGameRowToGame: (row: { slug: string; status: string }) => ({ slug: row.slug, status: row.status }),
}));

describe("source cutover (DB-only once seeded)", () => {
  beforeEach(() => vi.resetModules());

  it("projects: static fixtures do NOT leak when DB has rows", async () => {
    dbProjects.mockResolvedValueOnce([{ id: "1", slug: "db-proj" }]);
    const { getProjectsSource } = await import("@/lib/projects/source");
    const result = await getProjectsSource();
    expect(result.map((p) => p.slug)).toEqual(["db-proj"]);
  });

  it("projects: cold start (empty DB) still returns static", async () => {
    dbProjects.mockResolvedValueOnce([]);
    const { getProjectsSource } = await import("@/lib/projects/source");
    const result = await getProjectsSource();
    expect(result.map((p) => p.slug)).toEqual(["static-only"]);
  });

  it("games: static fixtures do NOT leak when DB has rows", async () => {
    dbGames.mockResolvedValueOnce([{ id: "1", slug: "db-game", status: "ready" }]);
    const { getGamesSource } = await import("@/lib/games/source");
    const result = await getGamesSource();
    expect(result.map((g) => g.slug)).toEqual(["db-game"]);
  });

  it("games: cold start (empty DB) returns ready static", async () => {
    dbGames.mockResolvedValueOnce([]);
    const { getGamesSource } = await import("@/lib/games/source");
    const result = await getGamesSource();
    expect(result.map((g) => g.slug)).toEqual(["static-game"]);
  });
});
