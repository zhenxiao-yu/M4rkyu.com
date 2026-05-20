"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// Admin server actions for resources. Same posture as the projects
// admin: requireAdmin gate, Zod-validated input, RLS as the
// underlying enforcement layer.

const SLUG_RE = /^[a-z0-9-]+$/;

const TYPE = z.enum(["link", "tool"]);
const CONTENT_STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const resourceFormSchema = z.object({
  slug: z.string().regex(SLUG_RE).min(1).max(80),
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

function revalidateResources() {
  revalidatePath("/(.*)/admin/resources", "page");
  revalidatePath("/(.*)/resources", "page");
  revalidatePath("/(.*)/resources/tools", "page");
  revalidatePath("/(.*)/resources/links", "page");
}

export async function createResourceAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseForm(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("resources").insert({
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
  });
  if (error) throw new Error(error.message);

  revalidateResources();
  redirect(`/admin/resources/${parsed.slug}`);
}

export async function updateResourceAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");
  const parsed = parseForm(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("resources")
    .update({
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
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateResources();
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
