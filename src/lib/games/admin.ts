"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// Admin server actions for games. Same posture as the projects
// admin: requireAdmin gate, Zod-validated input, RLS as the
// underlying enforcement layer.

const SLUG_RE = /^[a-z0-9-]+$/;

const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const buildLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const gameFormSchema = z.object({
  slug: z.string().regex(SLUG_RE).min(1).max(80),
  title: z.string().min(1).max(160),
  engine: z.string().min(1).max(120),
  year: z.string().min(1).max(16),
  status: CONTENT_STATUS.default("draft"),
  pitch: z.string().default(""),
  role: z.string().default(""),
  notes: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  pillars: z.array(z.string()).default([]),
  postmortem: z.string().default(""),
  outcome: z.string().default(""),
  coverSrc: z.string().default(""),
  coverAlt: z.string().max(240).default(""),
  trailerUrl: z.string().url().optional().or(z.literal("")),
  buildLinks: z.array(buildLinkSchema).default([]),
  sortOrder: z.coerce.number().int().default(0),
});

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Textarea arrays: one item per line, trimmed, empties dropped.
function arrayField(formData: FormData, key: string): string[] {
  return pickField(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// buildLinks textarea: one link per line in `Label|https://url` form.
// Lines without a `|`, an empty label, or an empty URL are dropped.
// The schema's `.url()` then validates each surviving URL.
function buildLinksField(
  formData: FormData,
  key: string,
): { label: string; url: string }[] {
  return arrayField(formData, key)
    .map((line) => {
      const idx = line.indexOf("|");
      if (idx === -1) return null;
      const label = line.slice(0, idx).trim();
      const url = line.slice(idx + 1).trim();
      if (!label || !url) return null;
      return { label, url };
    })
    .filter((item): item is { label: string; url: string } => item !== null);
}

function nullishUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseForm(formData: FormData) {
  return gameFormSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    engine: pickField(formData, "engine") || "TBD",
    year: pickField(formData, "year") || new Date().getFullYear().toString(),
    status: pickField(formData, "status") || "draft",
    pitch: pickField(formData, "pitch"),
    role: pickField(formData, "role"),
    notes: arrayField(formData, "notes"),
    platforms: arrayField(formData, "platforms"),
    pillars: arrayField(formData, "pillars"),
    postmortem: pickField(formData, "postmortem"),
    outcome: pickField(formData, "outcome"),
    coverSrc: pickField(formData, "coverSrc"),
    coverAlt: pickField(formData, "coverAlt"),
    trailerUrl: pickField(formData, "trailerUrl") || "",
    buildLinks: buildLinksField(formData, "buildLinks"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });
}

export async function createGameAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseForm(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("games").insert({
    slug: parsed.slug,
    title: parsed.title,
    engine: parsed.engine,
    year: parsed.year,
    status: parsed.status,
    pitch: parsed.pitch,
    role: parsed.role,
    notes: parsed.notes,
    platforms: parsed.platforms,
    pillars: parsed.pillars,
    postmortem: parsed.postmortem || null,
    outcome: parsed.outcome || null,
    cover_src: parsed.coverSrc || null,
    cover_alt: parsed.coverAlt || null,
    trailer_url: nullishUrl(parsed.trailerUrl ?? ""),
    build_links: parsed.buildLinks,
    sort_order: parsed.sortOrder,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/games", "page");
  revalidatePath("/(.*)/games", "page");
  revalidatePath(`/(.*)/games/${parsed.slug}`, "page");
  redirect(`/admin/games/${parsed.slug}`);
}

export async function updateGameAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const parsed = parseForm(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("games")
    .update({
      slug: parsed.slug,
      title: parsed.title,
      engine: parsed.engine,
      year: parsed.year,
      status: parsed.status,
      pitch: parsed.pitch,
      role: parsed.role,
      notes: parsed.notes,
      platforms: parsed.platforms,
      pillars: parsed.pillars,
      postmortem: parsed.postmortem || null,
      outcome: parsed.outcome || null,
      cover_src: parsed.coverSrc || null,
      cover_alt: parsed.coverAlt || null,
      trailer_url: nullishUrl(parsed.trailerUrl ?? ""),
      build_links: parsed.buildLinks,
      sort_order: parsed.sortOrder,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/games", "page");
  revalidatePath("/(.*)/games", "page");
  revalidatePath(`/(.*)/games/${parsed.slug}`, "page");
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/games", "page");
  revalidatePath("/(.*)/games", "page");
  redirect("/admin/games");
}
