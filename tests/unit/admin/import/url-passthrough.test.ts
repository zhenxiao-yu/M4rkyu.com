import { describe, it, expect, vi, beforeEach } from "vitest";

// env is read at call time; stub it so the storage branch has a base URL.
vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" },
}));

describe("image url passthrough", () => {
  beforeEach(() => vi.resetModules());

  it("contentImageUrlFor returns absolute /public paths unchanged", async () => {
    const { contentImageUrlFor } = await import("@/lib/content-images/storage");
    expect(contentImageUrlFor("/project-covers/x.webp")).toBe("/project-covers/x.webp");
  });

  it("contentImageUrlFor still builds the bucket URL for storage keys", async () => {
    const { contentImageUrlFor } = await import("@/lib/content-images/storage");
    expect(contentImageUrlFor("projects/x-abc.webp")).toBe(
      "https://x.supabase.co/storage/v1/object/public/content-images/projects/x-abc.webp",
    );
  });

  it("storageUrlFor returns absolute /gallery paths unchanged", async () => {
    const { storageUrlFor } = await import("@/lib/gallery/db");
    expect(storageUrlFor("/gallery/black-white.svg")).toBe("/gallery/black-white.svg");
  });

  it("storageUrlFor still builds the gallery bucket URL for storage keys", async () => {
    const { storageUrlFor } = await import("@/lib/gallery/db");
    expect(storageUrlFor("black-white/frame-01.webp")).toBe(
      "https://x.supabase.co/storage/v1/object/public/gallery-images/black-white/frame-01.webp",
    );
  });
});
