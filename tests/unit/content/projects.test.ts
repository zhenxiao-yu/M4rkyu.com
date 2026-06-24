import { describe, expect, it } from "vitest";

import { allProjects } from "@/content/projects";

describe("published project case studies", () => {
  const published = allProjects.filter(
    (project) => project.contentStatus === "ready",
  );

  it("includes project context and implementation constraints", () => {
    for (const project of published) {
      expect(project.timeline, project.slug).toBeTruthy();
      expect(project.platforms.length, project.slug).toBeGreaterThan(0);
      expect(project.challenges.length, project.slug).toBeGreaterThan(0);
      expect(project.decisions.length, project.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses a real cover and at least one labeled gallery image", () => {
    for (const project of published) {
      expect(project.screenshots.length, project.slug).toBeGreaterThanOrEqual(
        2,
      );
      expect(project.screenshots[0]?.width, project.slug).toBeTypeOf("number");
      expect(project.screenshots[0]?.height, project.slug).toBeTypeOf("number");
      expect(
        project.screenshots.slice(1).some((shot) => Boolean(shot.label)),
        project.slug,
      ).toBe(true);
    }
  });
});
