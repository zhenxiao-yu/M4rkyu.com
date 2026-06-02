"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
  dbErrorToMessage,
} from "@/lib/admin/action-state";

// Bulk-import selected GitHub repos as DRAFT projects. The sync screen sends
// each checked repo as a JSON `repos` value (produced by repoToProjectDraft);
// we re-validate here since form values are client-submitted, dedupe against
// existing slugs, and insert with content_status='draft' + empty narrative
// fields (the admin schema allows empties) so nothing fabricated goes public.

const SLUG_RE = /^[a-z0-9-]+$/;

const draftSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().regex(SLUG_RE).min(1).max(80),
  shortPitch: z.string().max(600).default(""),
  category: z
    .enum(["web-app", "game-dev", "ai-tool", "art-film", "experiment", "maintenance"])
    .default("experiment"),
  year: z.string().max(16).default(""),
  status: z
    .enum(["ready", "development", "maintenance", "archived", "draft"])
    .default("development"),
  stack: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  liveUrl: z.string().default(""),
  githubUrl: z.string().default(""),
  stars: z.number().default(0),
});

type Draft = z.infer<typeof draftSchema>;

function httpUrlOrNull(value: string): string | null {
  const v = value.trim();
  return v && /^https?:\/\//.test(v) ? v : null;
}

function rowFrom(d: Draft) {
  return {
    slug: d.slug,
    title: d.title,
    short_pitch: d.shortPitch,
    category: d.category,
    year: d.year || new Date().getFullYear().toString(),
    status: d.status,
    content_status: "draft" as const,
    featured: false,
    // Narrative case-study fields are the owner's to write — left empty.
    problem: "",
    solution: "",
    role: "",
    outcome: "",
    stack: d.stack,
    tags: d.tags,
    features: [],
    architecture_notes: [],
    challenges: [],
    lessons_learned: [],
    next_steps: [],
    live_url: httpUrlOrNull(d.liveUrl),
    github_url: httpUrlOrNull(d.githubUrl),
    cover_image_src: null,
    cover_image_alt: "",
    seo_title: d.title,
    seo_description: d.shortPitch.slice(0, 280),
    sort_order: 0,
  };
}

export async function importGithubReposAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const drafts: Draft[] = [];
  for (const value of formData.getAll("repos")) {
    if (typeof value !== "string") continue;
    try {
      const parsed = draftSchema.safeParse(JSON.parse(value));
      if (parsed.success) drafts.push(parsed.data);
    } catch {
      // skip malformed payloads
    }
  }
  if (drafts.length === 0) {
    return adminError("Select at least one repository to import.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from("projects")
    .select("slug");
  if (readError) return adminError(dbErrorToMessage(readError.message));

  const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  const seen = new Set<string>();
  const toInsert = drafts.filter((d) => {
    if (taken.has(d.slug) || seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  });
  const skipped = drafts.length - toInsert.length;
  if (toInsert.length === 0) {
    return adminError(
      `All ${drafts.length} selected repo(s) already exist as projects.`,
    );
  }

  const { error } = await supabase.from("projects").insert(toInsert.map(rowFrom));
  if (error) return adminError(dbErrorToMessage(error.message));

  revalidatePath("/work");
  return adminSuccess(
    `Imported ${toInsert.length} draft project(s)${
      skipped ? `; skipped ${skipped} already present` : ""
    }. Edit and publish them from the list.`,
  );
}
