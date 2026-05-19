import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Project } from "@/content/schemas";

// DB-backed projects reads. Wrapped in React cache() so multiple
// callers per render hit Supabase once. All return arrays — never
// null — so callers can fall back cleanly to src/content/projects.ts
// when the table is empty.

export interface DbProjectRow {
  id: string;
  slug: string;
  title: string;
  short_pitch: string;
  category: Project["category"];
  year: string;
  status: Project["status"];
  content_status: Project["contentStatus"];
  featured: boolean;
  problem: string;
  solution: string;
  role: string;
  outcome: string;
  stack: string[];
  tags: string[];
  features: string[];
  architecture_notes: string[];
  challenges: string[];
  lessons_learned: string[];
  next_steps: string[];
  live_url: string | null;
  github_url: string | null;
  cover_image_src: string | null;
  cover_image_alt: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, title, short_pitch, category, year, status, content_status, featured, problem, solution, role, outcome, stack, tags, features, architecture_notes, challenges, lessons_learned, next_steps, live_url, github_url, cover_image_src, cover_image_alt, seo_title, seo_description, sort_order";

export const getDbProjects = cache(async (): Promise<DbProjectRow[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as DbProjectRow[];
});

export const getDbProjectBySlug = cache(
  async (slug: string): Promise<DbProjectRow | null> => {
    if (!isSupabaseConfigured()) return null;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select(SELECT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as DbProjectRow;
  },
);

// Map a DB row to the Project shape consumed by /work and /work/[slug].
// Some fields in the schema don't live in the DB yet (translations,
// screenshots[] beyond cover image) — we surface empty defaults so
// the existing components don't need to learn about the new source.
export function dbProjectRowToProject(row: DbProjectRow): Project {
  return {
    title: row.title,
    slug: row.slug,
    shortPitch: row.short_pitch,
    category: row.category,
    year: row.year,
    status: row.status,
    contentStatus: row.content_status,
    featured: row.featured,
    problem: row.problem,
    solution: row.solution,
    role: row.role,
    stack: row.stack,
    tags: row.tags ?? [],
    features: row.features,
    architectureNotes: row.architecture_notes,
    challenges: row.challenges,
    screenshots: row.cover_image_src
      ? [{ src: row.cover_image_src, alt: row.cover_image_alt || row.title }]
      : [],
    liveUrl: row.live_url ?? undefined,
    githubUrl: row.github_url ?? undefined,
    outcome: row.outcome,
    lessonsLearned: row.lessons_learned,
    nextSteps: row.next_steps,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || row.short_pitch,
    },
  };
}
