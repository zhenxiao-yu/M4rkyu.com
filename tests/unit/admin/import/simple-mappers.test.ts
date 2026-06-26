import { describe, it, expect } from "vitest";
import {
  staticMediaToRow, staticResourceToRow, staticNoteToRow, staticProductToRow,
} from "@/lib/admin/import/sections/simple";

describe("simple import mappers", () => {
  it("media maps poster to poster_path/alt, forces draft", () => {
    const row = staticMediaToRow({ title: "Reel", slug: "reel", format: "reel", status: "ready", description: "d", poster: { src: "/m/reel.webp", alt: "a" } } as never);
    expect(row).toMatchObject({ slug: "reel", status: "draft", poster_path: "/m/reel.webp", poster_alt: "a" });
  });

  it("resource maps name/link/icon_key, forces draft", () => {
    const row = staticResourceToRow({ name: "Figma", slug: "figma", category: "design", description: "d", why: "w", type: "tool", link: "https://figma.com", pricing: "free", tags: ["ui"], status: "ready", featured: true, iconKey: "Palette" } as never);
    expect(row).toMatchObject({ slug: "figma", name: "Figma", link: "https://figma.com", icon_key: "Palette", status: "draft", featured: true });
  });

  it("note maps kind/body/tiers(line text), forces draft", () => {
    const row = staticNoteToRow({ slug: "n1", kind: "tierlist", title: "T", body: "B", status: "ready", tags: ["x"], publishedAt: "2025-01-01", tiers: [{ label: "S", items: ["a", "b"] }] } as never);
    expect(row).toMatchObject({ slug: "n1", kind: "tierlist", body: "B", status: "draft" });
    expect(row.tiers).toBe("S: a, b");
  });

  it("product maps price_in_cents + image_path, forces draft", () => {
    const row = staticProductToRow({ slug: "tee", title: "Tee", summary: "s", description: "", category: "wear", kind: "physical", priceInCents: 2500, currency: "usd", image: { src: "/shop/tee.webp", alt: "a" }, status: "ready", featured: false, inStock: true, tags: [] } as never);
    expect(row).toMatchObject({ slug: "tee", price_in_cents: 2500, image_path: "/shop/tee.webp", image_alt: "a", status: "draft" });
  });
});
