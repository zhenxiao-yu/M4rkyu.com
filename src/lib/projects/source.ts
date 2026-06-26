import "server-only";

import { cache } from "react";
import { allProjects } from "@/content/projects";
import {
  dbProjectRowToProject,
  getPublicDbProjects,
  getPublicScreenshotsByProject,
} from "@/lib/projects/db";
import type { Project } from "@/content/schemas";

// Unified read of projects — DB first, static src/content/projects.ts
// as zero-downtime fallback. Public surfaces (/work, /work/[slug],
// sitemap) consume this and never see the underlying source.
//
// Cutover: as soon as the projects table has ≥1 row, the public
// surface flips to DB-backed reads. Until then, the static array
// remains authoritative.

export const getProjectsSource = cache(async (): Promise<Project[]> => {
  const rows = await getPublicDbProjects();
  // Cold start only: an empty table serves the static fixtures so the page
  // never goes blank. Once seeded, the DB is the single source of truth —
  // static rows no longer leak through (run /admin/import to bring legacy
  // content into the DB).
  if (rows.length === 0) return allProjects;
  // Attach uploaded gallery screenshots in one batched read (grouped by
  // project id) so the detail page has labeled shots without an N+1.
  const shotsByProject = await getPublicScreenshotsByProject(
    rows.map((row) => row.id),
  );
  return rows.map((row) =>
    dbProjectRowToProject(row, shotsByProject.get(row.id) ?? []),
  );
});

export const getProjectFromSource = cache(
  async (slug: string): Promise<Project | undefined> => {
    const projects = await getProjectsSource();
    return projects.find((p) => p.slug === slug);
  },
);
