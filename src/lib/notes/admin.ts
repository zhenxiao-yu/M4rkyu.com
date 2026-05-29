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

// Admin server actions for the /notes microblog. requireAdmin gate,
// Zod-validated input, RLS as the underlying enforcement layer.
// create/update return an AdminActionState so the form shows inline
// feedback; the lightweight status/reorder/duplicate actions power the
// list UI. Mirrors src/lib/media/admin.ts.

const SLUG_RE = /^[a-z0-9-]+$/;

const KIND = z.enum(["update", "repost", "note", "review", "tierlist"]);
const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

function arrayField(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isUrl(value: string): boolean {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const noteFormSchema = z.object({
  slug: z
    .string()
    .regex(SLUG_RE, "lowercase letters, numbers, hyphens")
    .min(1)
    .max(100),
  kind: KIND.default("note"),
  title: z.string().max(200).default(""),
  body: z.string().max(8000).default(""),
  status: CONTENT_STATUS.default("draft"),
  tags: z.string().default(""),
  publishedAt: z.string().min(1, "Pick a date"),
  linkUrl: z.string().trim().max(500).default("").refine(isUrl, "Enter a valid URL"),
  linkLabel: z.string().max(200).default(""),
  rating: z.coerce.number().int().min(0).max(5).default(0),
  tiers: z.string().max(4000).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

const DATA_COLUMNS =
  "slug, kind, title, body, status, tags, published_at, link_url, link_label, rating, tiers, sort_order";

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function nullishText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseForm(formData: FormData) {
  return noteFormSchema.parse({
    slug: pickField(formData, "slug"),
    kind: pickField(formData, "kind") || "note",
    title: pickField(formData, "title"),
    body: pickField(formData, "body"),
    status: pickField(formData, "status") || "draft",
    tags: pickField(formData, "tags"),
    publishedAt: pickField(formData, "publishedAt") || todayIso(),
    linkUrl: pickField(formData, "linkUrl"),
    linkLabel: pickField(formData, "linkLabel"),
    rating: pickField(formData, "rating") || "0",
    tiers: pickField(formData, "tiers"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });
}

function toRow(parsed: z.infer<typeof noteFormSchema>) {
  const hasLink = parsed.kind === "repost" || parsed.kind === "review";
  return {
    slug: parsed.slug,
    kind: parsed.kind,
    title: parsed.title.trim(),
    body: parsed.body,
    status: parsed.status,
    tags: arrayField(parsed.tags),
    published_at: parsed.publishedAt,
    link_url: hasLink ? nullishText(parsed.linkUrl) : null,
    link_label: hasLink ? nullishText(parsed.linkLabel) : null,
    rating: parsed.kind === "review" ? parsed.rating : null,
    tiers: parsed.kind === "tierlist" ? nullishText(parsed.tiers) : null,
    sort_order: parsed.sortOrder,
  };
}

function revalidateNotes() {
  revalidatePath("/(.*)/admin/notes", "page");
  revalidatePath("/(.*)/notes", "page");
}

export async function createNoteAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof noteFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("notes").insert(toRow(parsed));
  if (error) {
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  revalidateNotes();
  redirect(`/admin/notes/${parsed.slug}`);
}

export async function updateNoteAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof noteFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("notes").update(toRow(parsed)).eq("id", id);
  if (error) {
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  revalidateNotes();
  return adminSuccess();
}

export async function deleteNoteAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateNotes();
  redirect("/admin/notes");
}

export async function setNoteStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").update({ status: parsed.data }).eq("id", id);
  revalidateNotes();
}

export async function reorderNoteAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notes")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await Promise.all(
    rows
      .map((row, position) => ({ row, position }))
      .filter(({ row, position }) => row.sort_order !== position)
      .map(({ row, position }) =>
        supabase.from("notes").update({ sort_order: position }).eq("id", row.id),
      ),
  );
  revalidateNotes();
}

export async function bulkSetNoteStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").update({ status: parsed.data }).in("id", ids);
  revalidateNotes();
}

export async function bulkDeleteNotesAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").delete().in("id", ids);
  revalidateNotes();
}

export async function duplicateNoteAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notes")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; title: string };

  let slug = `${source.slug}-copy`.slice(0, 100);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("notes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 100);
    if (n > 50) return;
  }

  const { error } = await supabase.from("notes").insert({
    ...source,
    slug,
    title: source.title ? `${source.title} (copy)` : "",
    status: "draft",
  });
  if (error) return;
  revalidateNotes();
  redirect(`/admin/notes/${slug}`);
}
