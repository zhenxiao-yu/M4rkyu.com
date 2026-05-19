"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// Admin server actions for projects. Same posture as the gallery
// admin: requireAdmin gate, Zod-validated input, RLS as the
// underlying enforcement layer.

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
const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const projectFormSchema = z.object({
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

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function booleanField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

// Textarea arrays: one item per line, trimmed, empties dropped.
function arrayField(formData: FormData, key: string): string[] {
  return pickField(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function nullishUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseForm(formData: FormData) {
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

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseForm(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").insert({
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
  });
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/projects", "page");
  revalidatePath("/(.*)/work", "page");
  revalidatePath(`/(.*)/work/${parsed.slug}`, "page");
  redirect(`/admin/projects/${parsed.slug}`);
}

export async function updateProjectAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const parsed = parseForm(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .update({
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
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/projects", "page");
  revalidatePath("/(.*)/work", "page");
  revalidatePath(`/(.*)/work/${parsed.slug}`, "page");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/projects", "page");
  revalidatePath("/(.*)/work", "page");
  redirect("/admin/projects");
}
