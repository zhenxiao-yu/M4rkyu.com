"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
  dbErrorToMessage,
  zodToActionState,
} from "@/lib/admin/action-state";
import {
  uploadContentImage,
  deleteContentImage,
} from "@/lib/content-images/storage";

// Admin server actions for projects. requireAdmin gate, Zod-validated
// input, RLS as the underlying enforcement layer. create/update return
// an AdminActionState so the form shows inline feedback instead of
// throwing; the lightweight status/reorder/duplicate actions power the
// list UI. Note: projects use `content_status` for public visibility
// (`status` is the lifecycle field).

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

// Grouped stack textarea: one group per line, `Group: item, item, item`.
// Lines without a colon become a group with no name's-worth content are
// dropped; empty item lists are dropped.
function stackGroupsField(
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

const DATA_COLUMNS =
  "slug, title, short_pitch, category, year, status, content_status, featured, problem, solution, role, outcome, stack, tagline, timeline, platforms, stack_groups, tags, features, architecture_notes, challenges, lessons_learned, next_steps, live_url, github_url, cover_image_src, cover_image_alt, seo_title, seo_description, sort_order";

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

function toRow(parsed: z.infer<typeof projectFormSchema>) {
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

async function uploadCoverIfPresent(
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

function revalidateProjects(slug?: string) {
  revalidatePath("/(.*)/admin/projects", "page");
  revalidatePath("/(.*)/work", "page");
  if (slug) revalidatePath(`/(.*)/work/${slug}`, "page");
}

export async function createProjectAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof projectFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const upload = await uploadCoverIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .insert({ ...toRow(parsed), cover_path: upload.path });
  if (error) {
    if (upload.path) await deleteContentImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  revalidateProjects(parsed.slug);
  redirect(`/admin/projects/${parsed.slug}`);
}

export async function updateProjectAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof projectFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const upload = await uploadCoverIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  const patch = upload.path
    ? { ...toRow(parsed), cover_path: upload.path }
    : toRow(parsed);

  // Grab the old path first so a successful re-upload can clean up.
  let oldPath: string | null = null;
  if (upload.path) {
    const { data } = await supabase
      .from("projects")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    oldPath = (data?.cover_path as string | null | undefined) ?? null;
  }

  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) {
    if (upload.path) await deleteContentImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  if (upload.path && oldPath && oldPath !== upload.path) {
    await deleteContentImage(oldPath);
  }

  revalidateProjects(parsed.slug);
  return adminSuccess();
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("projects")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle();
  const coverPath = row?.cover_path as string | null | undefined;

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (coverPath) await deleteContentImage(coverPath);

  revalidateProjects();
  redirect("/admin/projects");
}

export async function setProjectStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("projects").update({ content_status: parsed.data }).eq("id", id);
  revalidateProjects();
}

export async function reorderProjectAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  // Normalize sort_order to the new positions; only write what changed.
  await Promise.all(
    rows
      .map((row, position) => ({ row, position }))
      .filter(({ row, position }) => row.sort_order !== position)
      .map(({ row, position }) =>
        supabase.from("projects").update({ sort_order: position }).eq("id", row.id),
      ),
  );
  revalidateProjects();
}

export async function bulkSetProjectStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("projects")
    .update({ content_status: parsed.data })
    .in("id", ids);
  revalidateProjects();
}

export async function bulkDeleteProjectsAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("projects").delete().in("id", ids);
  revalidateProjects();
}

// ── Screenshots (project_screenshots + content-images bucket) ──────
// The manager on the edit page posts these as plain form actions; each
// revalidates so the server-rendered list refreshes. Files land in the
// same content-images bucket as covers, slug-prefixed.

function intOrNull(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function addProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const projectId = pickField(formData, "projectId");
  const slug = pickField(formData, "slug") || "project";
  if (!projectId) return;
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return;

  const upload = await uploadContentImage(file, `projects/${slug}/shot`);
  if (!upload) return;

  const supabase = await createSupabaseServerClient();
  // Append at the end of the current order.
  const { count } = await supabase
    .from("project_screenshots")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase.from("project_screenshots").insert({
    project_id: projectId,
    path: upload.path,
    alt: pickField(formData, "alt"),
    label: pickField(formData, "label"),
    caption: pickField(formData, "caption"),
    width: intOrNull(pickField(formData, "width")),
    height: intOrNull(pickField(formData, "height")),
    sort_order: count ?? 0,
  });
  if (error) {
    await deleteContentImage(upload.path);
    return;
  }
  revalidateProjects(slug);
}

export async function updateProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  const slug = pickField(formData, "slug");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("project_screenshots")
    .update({
      alt: pickField(formData, "alt"),
      label: pickField(formData, "label"),
      caption: pickField(formData, "caption"),
    })
    .eq("id", id);
  revalidateProjects(slug || undefined);
}

export async function deleteProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  const slug = pickField(formData, "slug");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("project_screenshots")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  const path = (data?.path as string | null | undefined) ?? null;
  const { error } = await supabase.from("project_screenshots").delete().eq("id", id);
  if (error) return;
  if (path) await deleteContentImage(path);
  revalidateProjects(slug || undefined);
}

export async function reorderProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  const slug = pickField(formData, "slug");
  const direction = pickField(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("project_screenshots")
    .select("id, project_id, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const row = data as { id: string; project_id: string; sort_order: number };
  const { data: siblings } = await supabase
    .from("project_screenshots")
    .select("id, sort_order")
    .eq("project_id", row.project_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const rows = (siblings ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await Promise.all(
    rows
      .map((r, position) => ({ r, position }))
      .filter(({ r, position }) => r.sort_order !== position)
      .map(({ r, position }) =>
        supabase
          .from("project_screenshots")
          .update({ sort_order: position })
          .eq("id", r.id),
      ),
  );
  revalidateProjects(slug || undefined);
}

export async function duplicateProjectAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; title: string };

  // Find a free `<slug>-copy[-n]` slug.
  let slug = `${source.slug}-copy`.slice(0, 80);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 80);
    if (n > 50) return;
  }

  const { error } = await supabase
    .from("projects")
    .insert({ ...source, slug, title: `${source.title} (copy)`, content_status: "draft" });
  if (error) return;
  revalidateProjects();
  redirect(`/admin/projects/${slug}`);
}
