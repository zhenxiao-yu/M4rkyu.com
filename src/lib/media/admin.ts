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

// Admin server actions for media. requireAdmin gate, Zod-validated
// input, RLS as the underlying enforcement layer. create/update return
// an AdminActionState so the form shows inline feedback instead of
// throwing; the lightweight status/reorder/duplicate actions power the
// list UI.

const SLUG_RE = /^[a-z0-9-]+$/;

const FORMAT = z.enum(["video", "reel", "process", "poster"]);
const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const mediaFormSchema = z.object({
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(80),
  title: z.string().min(1).max(160),
  format: FORMAT,
  status: CONTENT_STATUS.default("draft"),
  description: z.string().default(""),
  duration: z.string().max(80).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

const DATA_COLUMNS =
  "slug, title, format, status, description, duration, sort_order";

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function nullishText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseForm(formData: FormData) {
  return mediaFormSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    format: pickField(formData, "format") || "video",
    status: pickField(formData, "status") || "draft",
    description: pickField(formData, "description"),
    duration: pickField(formData, "duration"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });
}

function toRow(parsed: z.infer<typeof mediaFormSchema>) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    format: parsed.format,
    status: parsed.status,
    description: parsed.description,
    duration: nullishText(parsed.duration),
    sort_order: parsed.sortOrder,
  };
}

function revalidateMedia(slug?: string) {
  revalidatePath("/(.*)/admin/media", "page");
  revalidatePath("/(.*)/media", "page");
  void slug;
}

export async function createMediaAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof mediaFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media_items").insert(toRow(parsed));
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateMedia(parsed.slug);
  redirect(`/admin/media/${parsed.slug}`);
}

export async function updateMediaAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof mediaFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media_items").update(toRow(parsed)).eq("id", id);
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateMedia(parsed.slug);
  return adminSuccess();
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateMedia();
  redirect("/admin/media");
}

export async function setMediaStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("media_items").update({ status: parsed.data }).eq("id", id);
  revalidateMedia();
}

export async function reorderMediaAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("media_items")
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
        supabase.from("media_items").update({ sort_order: position }).eq("id", row.id),
      ),
  );
  revalidateMedia();
}

export async function duplicateMediaAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("media_items")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; title: string };

  // Find a free `<slug>-copy[-n]` slug.
  let slug = `${source.slug}-copy`.slice(0, 80);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("media_items")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 80);
    if (n > 50) return;
  }

  const { error } = await supabase
    .from("media_items")
    .insert({ ...source, slug, title: `${source.title} (copy)`, status: "draft" });
  if (error) return;
  revalidateMedia();
  redirect(`/admin/media/${slug}`);
}
