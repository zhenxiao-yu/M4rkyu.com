"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// Admin server actions for media. Same posture as the projects
// admin: requireAdmin gate, Zod-validated input, RLS as the
// underlying enforcement layer.

const SLUG_RE = /^[a-z0-9-]+$/;

const FORMAT = z.enum(["video", "reel", "process", "poster"]);
const STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const mediaFormSchema = z.object({
  slug: z.string().regex(SLUG_RE).min(1).max(80),
  title: z.string().min(1).max(160),
  format: FORMAT,
  status: STATUS.default("draft"),
  description: z.string().default(""),
  duration: z.string().max(80).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

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

export async function createMediaAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseForm(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media_items").insert({
    slug: parsed.slug,
    title: parsed.title,
    format: parsed.format,
    status: parsed.status,
    description: parsed.description,
    duration: nullishText(parsed.duration),
    sort_order: parsed.sortOrder,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/media", "page");
  revalidatePath("/(.*)/media", "page");
  redirect(`/admin/media/${parsed.slug}`);
}

export async function updateMediaAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const parsed = parseForm(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("media_items")
    .update({
      slug: parsed.slug,
      title: parsed.title,
      format: parsed.format,
      status: parsed.status,
      description: parsed.description,
      duration: nullishText(parsed.duration),
      sort_order: parsed.sortOrder,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/media", "page");
  revalidatePath("/(.*)/media", "page");
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/(.*)/admin/media", "page");
  revalidatePath("/(.*)/media", "page");
  redirect("/admin/media");
}
