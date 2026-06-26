import { describe, it, expect } from "vitest";
import { staticCollectionToRow, staticItemToRow } from "@/lib/admin/import/sections/gallery";

describe("gallery import mappers", () => {
  it("maps a collection cover to cover_path/alt", () => {
    const row = staticCollectionToRow({ title: "B&W", slug: "black-white", description: "d", cover: { src: "/gallery/black-white.svg", alt: "cover", focal: "center" }, count: 0, status: "ready", mood: ["calm"], featured: true } as never);
    expect(row).toMatchObject({ slug: "black-white", cover_path: "/gallery/black-white.svg", cover_alt: "cover", status: "ready", featured: true });
  });

  it("maps an item to a gallery_items row with collection_id + storage_path", () => {
    const row = staticItemToRow({ title: "Frame", slug: "frame-01", collection: "black-white", type: "image", status: "ready", caption: "c", src: { src: "/gallery/bw/01.webp", alt: "a", width: 800, height: 1000 }, aspect: "4/5", tags: ["street"], mood: [], featured: false, pinned: false, related: [] } as never, "col-1");
    expect(row).toMatchObject({ collection_id: "col-1", slug: "frame-01", storage_path: "/gallery/bw/01.webp", alt: "a", width: 800, height: 1000, aspect: "4/5", type: "image", status: "ready" });
  });
});
