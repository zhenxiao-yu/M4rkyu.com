import "server-only";

import { cache } from "react";
import { allProjects } from "@/content/projects";
import {
  dbProjectRowToProject,
  getPublicDbProjects,
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
  if (rows.length === 0) return allProjects;
  return rows.map(dbProjectRowToProject);
});

export const getProjectFromSource = cache(
  async (slug: string): Promise<Project | undefined> => {
    const projects = await getProjectsSource();
    return projects.find((p) => p.slug === slug);
  },
);
