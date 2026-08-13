"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { reorderRow } from "@/lib/admin/reorder";
import { copySlugLikePattern, nextCopySlug } from "@/lib/admin/slug";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
  dbErrorToMessage,
  zodToActionState,
} from "@/lib/admin/action-state";
import { arrayField, booleanField, pickField } from "@/lib/admin/form-parsing";

// Admin server actions for resources. requireAdmin gate, Zod-validated
// input, RLS as the underlying enforcement layer. create/update return
// an AdminActionState so the form shows inline feedback instead of
// throwing; the lightweight status/reorder/duplicate actions power the
// list UI.

const SLUG_RE = /^[a-z0-9-]+$/;

const TYPE = z.enum(["link", "tool"]);
const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const resourceFormSchema = z.object({
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(80),
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  description: z.string().default(""),
  why: z.string().default(""),
  type: TYPE.default("link"),
  link: z.string().url(),
  pricing: z.string().max(80).default(""),
  tags: z.array(z.string()).default([]),
  status: CONTENT_STATUS.default("draft"),
  featured: z.coerce.boolean().default(false),
  iconKey: z.string().max(80).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

const DATA_COLUMNS =
  "slug, name, category, description, why, type, link, pricing, tags, status, featured, icon_key, sort_order";

function parseForm(formData: FormData) {
  return resourceFormSchema.parse({
    slug: pickField(formData, "slug"),
    name: pickField(formData, "name"),
    category: pickField(formData, "category") || "Reference",
    description: pickField(formData, "description"),
    why: pickField(formData, "why"),
    type: pickField(formData, "type") || "link",
    link: pickField(formData, "link"),
    pricing: pickField(formData, "pricing") || "Free",
    tags: arrayField(formData, "tags"),
    status: pickField(formData, "status") || "draft",
    featured: booleanField(formData, "featured"),
    iconKey: pickField(formData, "iconKey"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });
}

function toRow(parsed: z.infer<typeof resourceFormSchema>) {
  return {
    slug: parsed.slug,
    name: parsed.name,
    category: parsed.category,
    description: parsed.description,
    why: parsed.why,
    type: parsed.type,
    link: parsed.link,
    pricing: parsed.pricing,
    tags: parsed.tags,
    status: parsed.status,
    featured: parsed.featured,
    icon_key: parsed.iconKey || null,
    sort_order: parsed.sortOrder,
  };
}

function revalidateResources(slug?: string) {
  revalidatePath("/(.*)/admin/resources", "page");
  revalidatePath("/(.*)/resources", "page");
  revalidatePath("/(.*)/resources/tools", "page");
  revalidatePath("/(.*)/resources/links", "page");
  if (slug) revalidatePath(`/(.*)/admin/resources/${slug}`, "page");
}

export async function createResourceAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof resourceFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("resources").insert(toRow(parsed));
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateResources(parsed.slug);
  redirect(`/admin/resources/${parsed.slug}`);
}

export async function updateResourceAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof resourceFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("resources").update(toRow(parsed)).eq("id", id);
  if (error) return adminError(dbErrorToMessage(error.message), { slug: " " });

  revalidateResources(parsed.slug);
  return adminSuccess();
}

export async function deleteResourceAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateResources();
  redirect("/admin/resources");
}

export async function setResourceStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("resources").update({ status: parsed.data }).eq("id", id);
  revalidateResources();
}

export async function reorderResourceAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  await reorderRow("resources", id, direction);
  revalidateResources();
}

export async function bulkSetResourceStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("resources").update({ status: parsed.data }).in("id", ids);
  revalidateResources();
}

export async function bulkDeleteResourcesAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("resources").delete().in("id", ids);
  revalidateResources();
}

export async function duplicateResourceAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("resources")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; name: string };

  // Find a free `<slug>-copy[-n]` slug.
  const { data: takenSlugs } = await supabase
    .from("resources")
    .select("slug")
    .like("slug", copySlugLikePattern(source.slug));
  const slug = nextCopySlug(
    source.slug,
    ((takenSlugs ?? []) as { slug: string }[]).map((r) => r.slug),
  );

  const { error } = await supabase
    .from("resources")
    .insert({ ...source, slug, name: `${source.name} (copy)`, status: "draft" });
  if (error) return;
  revalidateResources();
  redirect(`/admin/resources/${slug}`);
}
