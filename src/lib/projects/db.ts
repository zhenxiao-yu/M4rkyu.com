import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseReadClient } from "@/lib/supabase/read";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { contentImageUrlFor } from "@/lib/content-images/storage";
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
  cover_path: string | null;
  tagline: string;
  timeline: string;
  platforms: string[];
  stack_groups: { group: string; items: string[] }[];
  seo_title: string;
  seo_description: string;
  sort_order: number;
}

// One labeled screenshot row (content-images bucket path + captions).
export interface DbProjectScreenshotRow {
  id: string;
  project_id: string;
  path: string;
  alt: string;
  label: string;
  caption: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, title, short_pitch, category, year, status, content_status, featured, problem, solution, role, outcome, stack, tags, features, architecture_notes, challenges, lessons_learned, next_steps, live_url, github_url, cover_image_src, cover_image_alt, cover_path, tagline, timeline, platforms, stack_groups, seo_title, seo_description, sort_order";

const SCREENSHOT_COLUMNS =
  "id, project_id, path, alt, label, caption, width, height, sort_order";

// `createSupabaseServerClient` reads request cookies, which throws
// when Next is enumerating `generateStaticParams` /
// `generateImageMetadata` / `sitemap` at build time (no request
// context). We try/catch around the cookies-using setup and fall
// back to an empty result — `getProjectsSource` then returns the
// static `allProjects` array, which is the intended build-time
// behaviour until the projects table is the source of truth.
export const getDbProjects = cache(async (): Promise<DbProjectRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select(SELECT_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DbProjectRow[];
  } catch {
    return [];
  }
});

export const getDbProjectBySlug = cache(
  async (slug: string): Promise<DbProjectRow | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("projects")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as DbProjectRow;
    } catch {
      return null;
    }
  },
);

// Cookieless public twins of the reads above. These use the anon read
// client (no `cookies()`), so callers can be statically rendered / ISR
// instead of forced dynamic. RLS (`content_status = 'ready' OR is_admin`)
// means an anon read returns ONLY ready rows — correct for public /work,
// while the cookie-bound `getDbProjects` above stays for admin (drafts).
export const getPublicDbProjects = cache(async (): Promise<DbProjectRow[]> => {
  const supabase = createSupabaseReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as DbProjectRow[];
});

export const getPublicDbProjectBySlug = cache(
  async (slug: string): Promise<DbProjectRow | null> => {
    const supabase = createSupabaseReadClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("projects")
      .select(SELECT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as DbProjectRow;
  },
);

// Public (anon) batch read of screenshots for a set of project ids,
// grouped by project_id and ordered. One query for the whole /work
// surface so the list render never N+1s. RLS exposes only screenshots
// whose parent project is `content_status = 'ready'`.
export const getPublicScreenshotsByProject = cache(
  async (projectIds: string[]): Promise<Map<string, DbProjectScreenshotRow[]>> => {
    const grouped = new Map<string, DbProjectScreenshotRow[]>();
    if (projectIds.length === 0) return grouped;
    const supabase = createSupabaseReadClient();
    if (!supabase) return grouped;
    const { data, error } = await supabase
      .from("project_screenshots")
      .select(SCREENSHOT_COLUMNS)
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) return grouped;
    for (const row of data as DbProjectScreenshotRow[]) {
      const list = grouped.get(row.project_id) ?? [];
      list.push(row);
      grouped.set(row.project_id, list);
    }
    return grouped;
  },
);

// Admin (cookie-bound) read of one project's screenshots, ids included
// so the manager can reorder / relabel / delete.
export const getProjectScreenshotsAdmin = cache(
  async (projectId: string): Promise<DbProjectScreenshotRow[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("project_screenshots")
        .select(SCREENSHOT_COLUMNS)
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error || !data) return [];
      return data as DbProjectScreenshotRow[];
    } catch {
      return [];
    }
  },
);

// Map a screenshot row to the schema's image shape (resolves the
// content-images public URL from the stored path).
export function dbScreenshotRowToImage(row: DbProjectScreenshotRow) {
  return {
    src: contentImageUrlFor(row.path) ?? "",
    alt: row.alt || row.label || "",
    label: row.label || undefined,
    caption: row.caption || undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
  };
}

// Map a DB row to the Project shape consumed by /work and /work/[slug].
// `screenshots` are the uploaded gallery rows (cover image is prepended
// here); translations don't live in the DB yet so default empty.
export function dbProjectRowToProject(
  row: DbProjectRow,
  screenshots: DbProjectScreenshotRow[] = [],
): Project {
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
    // screenshots[0] is the hero cover (uploaded wins over external URL);
    // the remaining entries are the labeled gallery rows. /work reads only
    // the cover; /work/[slug] uses the cover as hero + the rest as gallery.
    screenshots: (() => {
      const coverSrc = contentImageUrlFor(row.cover_path) ?? row.cover_image_src;
      const cover = coverSrc
        ? [{ src: coverSrc, alt: row.cover_image_alt || row.title }]
        : [];
      return [...cover, ...screenshots.map(dbScreenshotRowToImage)];
    })(),
    tagline: row.tagline || undefined,
    timeline: row.timeline || undefined,
    platforms: row.platforms ?? [],
    stackGroups: row.stack_groups ?? [],
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
