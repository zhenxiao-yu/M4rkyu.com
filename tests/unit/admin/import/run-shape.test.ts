import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/admin/import/sections/projects", () => ({ importProjects: vi.fn(async () => ({ section: "projects", totalStatic: 2, inserted: 2, skipped: 0, skippedSlugs: [] })) }));
vi.mock("@/lib/admin/import/sections/games", () => ({ importGames: vi.fn(async () => ({ section: "games", totalStatic: 1, inserted: 1, skipped: 0, skippedSlugs: [] })) }));
vi.mock("@/lib/admin/import/sections/simple", () => ({
  importMedia: vi.fn(async () => ({ section: "media", totalStatic: 0, inserted: 0, skipped: 0, skippedSlugs: [] })),
  importResources: vi.fn(async () => ({ section: "resources", totalStatic: 0, inserted: 0, skipped: 0, skippedSlugs: [] })),
  importNotes: vi.fn(async () => ({ section: "notes", totalStatic: 0, inserted: 0, skipped: 0, skippedSlugs: [] })),
  importShop: vi.fn(async () => ({ section: "shop", totalStatic: 0, inserted: 0, skipped: 0, skippedSlugs: [] })),
}));
vi.mock("@/lib/admin/import/sections/gallery", () => ({ importGallery: vi.fn(async () => ([{ section: "gallery_collections", totalStatic: 1, inserted: 1, skipped: 0, skippedSlugs: [] }, { section: "gallery_items", totalStatic: 3, inserted: 3, skipped: 0, skippedSlugs: [] }])) }));
vi.mock("@/lib/admin/import/sections/profile", () => ({ importProfile: vi.fn(async () => ({ section: "profile", totalStatic: 1, inserted: 1, skipped: 0, skippedSlugs: [] })) }));

describe("runAllImports", () => {
  it("flattens every section incl. gallery's two reports", async () => {
    const { runAllImports } = await import("@/lib/admin/import/run");
    const reports = await runAllImports(true);
    expect(reports.map((r) => r.section)).toEqual([
      "projects", "games", "media", "resources", "notes", "shop",
      "gallery_collections", "gallery_items", "profile",
    ]);
    // projects 2 + games 1 + gallery_collections 1 + gallery_items 3 + profile 1
    expect(reports.reduce((n, r) => n + r.inserted, 0)).toBe(8);
  });
});
