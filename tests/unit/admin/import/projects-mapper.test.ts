import { describe, it, expect } from "vitest";
import { staticProjectToRow, staticProjectScreenshotRows } from "@/lib/admin/import/sections/projects";
import type { Project } from "@/content/schemas";

const p = {
  title: "Nimbus", slug: "nimbus", shortPitch: "pitch", category: "web-app",
  year: "2025", status: "ready", contentStatus: "ready", featured: true,
  problem: "P", solution: "S", role: "R", stack: ["TS"], tags: ["cloud"],
  features: ["f"], architectureNotes: ["a"], decisions: [], challenges: [],
  screenshots: [
    { src: "/project-covers/nimbus-dashboard.webp", alt: "cover" },
    { src: "/project-covers/nimbus-features.webp", alt: "shot", label: "L", caption: "C", width: 1440, height: 1000 },
  ],
  platforms: [], stackGroups: [], outcome: "O", lessonsLearned: ["l"], nextSteps: ["n"],
  seo: { title: "T", description: "D" },
} as unknown as Project;

describe("projects import mappers", () => {
  it("maps the first screenshot to the cover and forces draft", () => {
    const row = staticProjectToRow(p);
    expect(row.slug).toBe("nimbus");
    expect(row.short_pitch).toBe("pitch");
    expect(row.content_status).toBe("draft");
    expect(row.cover_image_src).toBe("/project-covers/nimbus-dashboard.webp");
    expect(row.cover_image_alt).toBe("cover");
    expect(row.lessons_learned).toEqual(["l"]);
  });

  it("maps gallery shots (everything after the cover) to screenshot rows", () => {
    const rows = staticProjectScreenshotRows(p, "proj-1");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      project_id: "proj-1",
      path: "/project-covers/nimbus-features.webp",
      alt: "shot", label: "L", caption: "C", width: 1440, height: 1000, sort_order: 0,
    });
  });
});
