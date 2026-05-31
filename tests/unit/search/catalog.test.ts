import { describe, expect, it } from "vitest";

import { assembleCatalog, type SearchDoc } from "@/lib/search/catalog";
import type {
  GalleryItem,
  Game,
  MediaItem,
  Note,
  Project,
  Resource,
  Service,
} from "@/content/schemas";

// assembleCatalog only reads a handful of fields per type, so fixtures carry
// just those (cast to the content types) to keep the tests focused.
const project = (over: Partial<Project>): Project =>
  ({
    title: "Nimbus",
    slug: "nimbus",
    shortPitch: "A weather app",
    problem: "forecasts are ugly",
    category: "web-app",
    year: "2026",
    contentStatus: "ready",
    stack: ["Next.js"],
    tags: ["weather"],
    ...over,
  }) as unknown as Project;

const resource = (over: Partial<Resource>): Resource =>
  ({
    name: "Tool",
    slug: "tool",
    category: "Design",
    description: "does things",
    why: "useful",
    type: "link",
    link: "https://example.com",
    status: "ready",
    tags: ["design"],
    ...over,
  }) as unknown as Resource;

const note = (over: Partial<Note>): Note =>
  ({
    slug: "n1",
    kind: "update",
    title: "",
    body: "a thought",
    status: "ready",
    tags: [],
    ...over,
  }) as unknown as Note;

const empty = {
  projects: [] as Project[],
  games: [] as Game[],
  resources: [] as Resource[],
  gallery: [] as GalleryItem[],
  notes: [] as Note[],
  media: [] as MediaItem[],
  services: [] as Service[],
};

function build(over: Partial<typeof empty>): SearchDoc[] {
  return assembleCatalog({ ...empty, ...over });
}

describe("assembleCatalog", () => {
  it("returns an empty catalog for empty sources", () => {
    expect(build({})).toEqual([]);
  });

  it("excludes non-ready items (drafts stay out of search, like the sitemap)", () => {
    const docs = build({
      projects: [
        project({ slug: "live" }),
        project({ slug: "wip", contentStatus: "draft" }),
      ],
    });
    expect(docs.map((d) => d.id)).toEqual(["project:live"]);
  });

  it("builds a typed id and internal href for a project", () => {
    const [doc] = build({ projects: [project({ slug: "nimbus" })] });
    expect(doc).toMatchObject({
      id: "project:nimbus",
      type: "project",
      href: "/work/nimbus",
    });
    expect(doc.external).toBeUndefined();
    expect(doc.tags).toContain("weather");
  });

  it("marks link resources external but keeps tool resources internal", () => {
    const docs = build({
      resources: [
        resource({ slug: "ext", type: "link", link: "https://x.com" }),
        resource({ slug: "tool", type: "tool" }),
      ],
    });
    const ext = docs.find((d) => d.id === "resource:ext");
    const tool = docs.find((d) => d.id === "resource:tool");
    expect(ext).toMatchObject({ href: "https://x.com", external: true });
    expect(tool).toMatchObject({ href: "/resources/tool", external: false });
  });

  it("anchors a note to the feed and falls back to a kind-based title", () => {
    const [doc] = build({ notes: [note({ slug: "n9", title: "", kind: "review" })] });
    expect(doc.href).toBe("/notes#n9");
    expect(doc.title).toBe("review note");
  });

  it("produces unique ids across mixed content", () => {
    const docs = build({
      projects: [project({ slug: "a" })],
      resources: [resource({ slug: "a" })], // same slug, different type
    });
    const ids = docs.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["project:a", "resource:a"]);
  });

  it("clips long descriptions", () => {
    const [doc] = build({
      projects: [project({ shortPitch: "x".repeat(400), problem: "" })],
    });
    expect(doc.description.length).toBeLessThanOrEqual(240);
    expect(doc.description.endsWith("…")).toBe(true);
  });
});
