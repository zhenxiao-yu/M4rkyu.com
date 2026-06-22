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
  posterAlt: z.string().max(240).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

const DATA_COLUMNS =
  "slug, title, format, status, description, duration, poster_path, poster_alt, sort_order";

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
    posterAlt: pickField(formData, "posterAlt"),
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
    poster_alt: parsed.posterAlt,
    sort_order: parsed.sortOrder,
  };
}

async function uploadPosterIfPresent(
  formData: FormData,
  slug: string,
): Promise<{ path: string | null; error?: true }> {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadContentImage(file, `media/${slug}`);
    if (!upload) return { path: null, error: true };
    return { path: upload.path };
  }
  return { path: null };
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
  const upload = await uploadPosterIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("media_items")
    .insert({ ...toRow(parsed), poster_path: upload.path });
  if (error) {
    if (upload.path) await deleteContentImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

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
  const upload = await uploadPosterIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  // A new upload always wins; otherwise an explicit "Remove poster" nulls it.
  const removePoster = !upload.path && formData.get("removePoster") === "on";

  const patch = upload.path
    ? { ...toRow(parsed), poster_path: upload.path }
    : removePoster
      ? { ...toRow(parsed), poster_path: null }
      : toRow(parsed);

  // Capture the existing object so a replace OR a remove can clean it up.
  let oldPath: string | null = null;
  if (upload.path || removePoster) {
    const { data } = await supabase
      .from("media_items")
      .select("poster_path")
      .eq("id", id)
      .maybeSingle();
    oldPath = (data?.poster_path as string | null | undefined) ?? null;
  }

  const { error } = await supabase.from("media_items").update(patch).eq("id", id);
  if (error) {
    if (upload.path) await deleteContentImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  // Delete the previous object on both replace and remove.
  if (oldPath && oldPath !== upload.path && (upload.path || removePoster)) {
    await deleteContentImage(oldPath);
  }

  revalidateMedia(parsed.slug);
  return adminSuccess();
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("media_items")
    .select("poster_path")
    .eq("id", id)
    .maybeSingle();
  const posterPath = row?.poster_path as string | null | undefined;

  const { error } = await supabase.from("media_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (posterPath) await deleteContentImage(posterPath);

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

export async function bulkSetMediaStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("media_items").update({ status: parsed.data }).in("id", ids);
  revalidateMedia();
}

export async function bulkDeleteMediaAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("media_items").delete().in("id", ids);
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

  // Null the poster on the copy so two rows never point at one storage
  // object (a later delete of one would orphan the other's image).
  const { error } = await supabase.from("media_items").insert({
    ...source,
    slug,
    title: `${source.title} (copy)`,
    status: "draft",
    poster_path: null,
  });
  if (error) return;
  revalidateMedia();
  redirect(`/admin/media/${slug}`);
}
