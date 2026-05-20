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

// Admin server actions for games. requireAdmin gate, Zod-validated
// input, RLS as the underlying enforcement layer. create/update return
// an AdminActionState so the form shows inline feedback instead of
// throwing; the lightweight status/reorder/duplicate actions power the
// list UI.

const SLUG_RE = /^[a-z0-9-]+$/;

const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const buildLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const gameFormSchema = z.object({
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(80),
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

const DATA_COLUMNS =
  "slug, title, engine, year, status, pitch, role, notes, cover_src, cover_alt, trailer_url, platforms, pillars, postmortem, outcome, build_links, sort_order";

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function arrayField(formData: FormData, key: string): string[] {
  return pickField(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// buildLinks textarea: one link per line in `Label|https://url` form.
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

function toRow(parsed: z.infer<typeof gameFormSchema>) {
  return {
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
  };
}

function revalidateGames(slug?: string) {
  revalidatePath("/(.*)/admin/games", "page");
  revalidatePath("/(.*)/games", "page");
  if (slug) revalidatePath(`/(.*)/games/${slug}`, "page");
}

export async function createGameAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof gameFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("games").insert(toRow(parsed));
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateGames(parsed.slug);
  redirect(`/admin/games/${parsed.slug}`);
}

export async function updateGameAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof gameFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("games").update(toRow(parsed)).eq("id", id);
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateGames(parsed.slug);
  return adminSuccess();
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateGames();
  redirect("/admin/games");
}

export async function setGameStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("games").update({ status: parsed.data }).eq("id", id);
  revalidateGames();
}

export async function reorderGameAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("games")
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
        supabase.from("games").update({ sort_order: position }).eq("id", row.id),
      ),
  );
  revalidateGames();
}

export async function duplicateGameAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("games")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; title: string };

  // Find a free `<slug>-copy[-n]` slug.
  let slug = `${source.slug}-copy`.slice(0, 80);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("games")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 80);
    if (n > 50) return;
  }

  const { error } = await supabase
    .from("games")
    .insert({ ...source, slug, title: `${source.title} (copy)`, status: "draft" });
  if (error) return;
  revalidateGames();
  redirect(`/admin/games/${slug}`);
}
