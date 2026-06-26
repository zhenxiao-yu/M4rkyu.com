import "server-only";

import { allProjects } from "@/content/projects";
import type { Project } from "@/content/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { insertNewBySlug } from "../insert-new";
import type { ImportReport } from "../types";

export function staticProjectToRow(p: Project): Record<string, unknown> {
  const cover = p.screenshots[0];
  return {
    slug: p.slug,
    title: p.title,
    short_pitch: p.shortPitch,
    category: p.category,
    year: p.year,
    status: p.status,
    content_status: "draft", // imported content is never auto-published
    featured: p.featured,
    problem: p.problem,
    solution: p.solution,
    role: p.role,
    outcome: p.outcome,
    stack: p.stack,
    features: p.features,
    architecture_notes: p.architectureNotes,
    challenges: p.challenges,
    lessons_learned: p.lessonsLearned,
    next_steps: p.nextSteps,
    live_url: p.liveUrl ?? null,
    github_url: p.githubUrl ?? null,
    cover_image_src: cover?.src ?? null,
    cover_image_alt: cover?.alt ?? "",
    seo_title: p.seo.title,
    seo_description: p.seo.description,
    tagline: p.tagline ?? "",
    timeline: p.timeline ?? "",
    platforms: p.platforms,
    stack_groups: p.stackGroups,
    tags: p.tags,
    sort_order: 0,
  };
}

export function staticProjectScreenshotRows(
  p: Project,
  projectId: string,
): Record<string, unknown>[] {
  return p.screenshots.slice(1).map((shot, index) => ({
    project_id: projectId,
    path: shot.src,
    alt: shot.alt ?? "",
    label: shot.label ?? "",
    caption: shot.caption ?? "",
    width: shot.width ?? null,
    height: shot.height ?? null,
    sort_order: index,
  }));
}

export async function importProjects(dryRun: boolean): Promise<ImportReport> {
  const supabase = await createSupabaseServerClient();
  const result = await insertNewBySlug(
    supabase,
    "projects",
    allProjects,
    (p) => p.slug,
    staticProjectToRow,
    dryRun,
  );

  // Attach gallery screenshots for each newly inserted project.
  if (!dryRun && result.insertedRows.length > 0) {
    const bySlug = new Map(allProjects.map((p) => [p.slug, p]));
    const shotRows = result.insertedRows.flatMap(({ id, slug }) => {
      const p = bySlug.get(slug);
      return p ? staticProjectScreenshotRows(p, id) : [];
    });
    if (shotRows.length > 0) {
      const { error } = await supabase.from("project_screenshots").insert(shotRows);
      if (error) throw new Error(error.message);
    }
  }

  return {
    section: "projects",
    totalStatic: allProjects.length,
    inserted: result.inserted,
    skipped: result.skippedSlugs.length,
    skippedSlugs: result.skippedSlugs,
  };
}
