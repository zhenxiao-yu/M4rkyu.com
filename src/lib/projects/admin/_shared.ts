import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  uploadContentImage,
} from "@/lib/content-images/storage";

// Shared, NON-action helpers for the project admin server actions: Zod
// schemas, FormData parsing, row mapping, and revalidation. These export
// non-function values (schemas) and synchronous functions, so this file
// must NOT carry the "use server" directive — the action modules import
// from here.

const SLUG_RE = /^[a-z0-9-]+$/;

const CATEGORY = z.enum([
  "web-app",
  "game-dev",
  "ai-tool",
  "art-film",
  "experiment",
  "maintenance",
]);
const STATUS = z.enum(["ready", "development", "maintenance", "archived", "draft"]);
export const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

export const projectFormSchema = z.object({
  slug: z.string().regex(SLUG_RE).min(1).max(80),
  title: z.string().min(1).max(160),
  shortPitch: z.string().max(600).default(""),
  category: CATEGORY,
  year: z.string().min(1).max(16),
  status: STATUS,
  contentStatus: CONTENT_STATUS.default("draft"),
  featured: z.coerce.boolean().default(false),
  problem: z.string().default(""),
  solution: z.string().default(""),
  role: z.string().default(""),
  outcome: z.string().default(""),
  stack: z.array(z.string()).default([]),
  tagline: z.string().max(280).default(""),
  timeline: z.string().max(120).default(""),
  platforms: z.array(z.string()).default([]),
  stackGroups: z
    .array(z.object({ group: z.string().min(1), items: z.array(z.string()).default([]) }))
    .default([]),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  architectureNotes: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  lessonsLearned: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  coverImageSrc: z.string().default(""),
  coverImageAlt: z.string().max(240).default(""),
  seoTitle: z.string().max(160).default(""),
  seoDescription: z.string().max(280).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

export function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function booleanField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

// Textarea arrays: one item per line, trimmed, empties dropped.
export function arrayField(formData: FormData, key: string): string[] {
  return pickField(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Grouped stack textarea: one group per line, `Group: item, item, item`.
// Lines without a colon become a group with no name's-worth content are
// dropped; empty item lists are dropped.
export function stackGroupsField(
  formData: FormData,
  key: string,
): { group: string; items: string[] }[] {
  return pickField(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon < 0) return null;
      const group = line.slice(0, colon).trim();
      const items = line
        .slice(colon + 1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (!group || items.length === 0) return null;
      return { group, items };
    })
    .filter((g): g is { group: string; items: string[] } => g !== null);
}

function nullishUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function intOrNull(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const DATA_COLUMNS =
  "slug, title, short_pitch, category, year, status, content_status, featured, problem, solution, role, outcome, stack, tagline, timeline, platforms, stack_groups, tags, features, architecture_notes, challenges, lessons_learned, next_steps, live_url, github_url, cover_image_src, cover_image_alt, seo_title, seo_description, sort_order";

export function parseForm(formData: FormData) {
  return projectFormSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    shortPitch: pickField(formData, "shortPitch"),
    category: pickField(formData, "category") || "web-app",
    year: pickField(formData, "year") || new Date().getFullYear().toString(),
    status: pickField(formData, "status") || "draft",
    contentStatus: pickField(formData, "contentStatus") || "draft",
    featured: booleanField(formData, "featured"),
    problem: pickField(formData, "problem"),
    solution: pickField(formData, "solution"),
    role: pickField(formData, "role"),
    outcome: pickField(formData, "outcome"),
    stack: arrayField(formData, "stack"),
    tagline: pickField(formData, "tagline"),
    timeline: pickField(formData, "timeline"),
    platforms: arrayField(formData, "platforms"),
    stackGroups: stackGroupsField(formData, "stackGroups"),
    tags: arrayField(formData, "tags"),
    features: arrayField(formData, "features"),
    architectureNotes: arrayField(formData, "architectureNotes"),
    challenges: arrayField(formData, "challenges"),
    lessonsLearned: arrayField(formData, "lessonsLearned"),
    nextSteps: arrayField(formData, "nextSteps"),
    liveUrl: pickField(formData, "liveUrl") || "",
    githubUrl: pickField(formData, "githubUrl") || "",
    coverImageSrc: pickField(formData, "coverImageSrc"),
    coverImageAlt: pickField(formData, "coverImageAlt"),
    seoTitle: pickField(formData, "seoTitle"),
    seoDescription: pickField(formData, "seoDescription"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });
}

export function toRow(parsed: z.infer<typeof projectFormSchema>) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    short_pitch: parsed.shortPitch,
    category: parsed.category,
    year: parsed.year,
    status: parsed.status,
    content_status: parsed.contentStatus,
    featured: parsed.featured,
    problem: parsed.problem,
    solution: parsed.solution,
    role: parsed.role,
    outcome: parsed.outcome,
    stack: parsed.stack,
    tagline: parsed.tagline,
    timeline: parsed.timeline,
    platforms: parsed.platforms,
    stack_groups: parsed.stackGroups,
    tags: parsed.tags,
    features: parsed.features,
    architecture_notes: parsed.architectureNotes,
    challenges: parsed.challenges,
    lessons_learned: parsed.lessonsLearned,
    next_steps: parsed.nextSteps,
    live_url: nullishUrl(parsed.liveUrl ?? ""),
    github_url: nullishUrl(parsed.githubUrl ?? ""),
    cover_image_src: parsed.coverImageSrc || null,
    cover_image_alt: parsed.coverImageAlt,
    seo_title: parsed.seoTitle,
    seo_description: parsed.seoDescription,
    sort_order: parsed.sortOrder,
  };
}

export async function uploadCoverIfPresent(
  formData: FormData,
  slug: string,
): Promise<{ path: string | null; error?: true }> {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadContentImage(file, `projects/${slug}`);
    if (!upload) return { path: null, error: true };
    return { path: upload.path };
  }
  return { path: null };
}

export function revalidateProjects(slug?: string) {
  revalidatePath("/(.*)/admin/projects", "page");
  revalidatePath("/(.*)/work", "page");
  if (slug) revalidatePath(`/(.*)/work/${slug}`, "page");
}
