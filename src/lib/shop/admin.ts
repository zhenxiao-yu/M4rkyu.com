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
import { uploadProductImage, deleteProductImage } from "@/lib/shop/storage";

// Admin server actions for the shop catalog. requireAdmin gate,
// Zod-validated input, RLS as the underlying enforcement layer.
// create/update return an AdminActionState so the form shows inline
// feedback instead of throwing; the lightweight status/reorder/
// duplicate actions power the list UI. Products carry a cover image, so
// create + update both accept an optional upload (re-upload replaces
// and cleans up the old object). Price is integer cents to mirror
// Stripe and avoid float drift.

const SLUG_RE = /^[a-z0-9-]+$/;
const KIND = z.enum(["physical", "digital"]);
const STATUS = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

const productFormSchema = z.object({
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(80),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(280),
  description: z.string().max(4000).default(""),
  category: z.string().min(1).max(80),
  kind: KIND,
  priceInCents: z.coerce.number().int().nonnegative(),
  status: STATUS.default("placeholder"),
  featured: z.coerce.boolean().default(false),
  inStock: z.coerce.boolean().default(true),
  tags: z.array(z.string()).default([]),
  digitalNote: z.string().max(400).default(""),
  imageAlt: z.string().max(240).default(""),
  sortOrder: z.coerce.number().int().default(0),
});

const DATA_COLUMNS =
  "slug, title, summary, description, category, kind, price_in_cents, currency, image_path, image_alt, status, featured, in_stock, tags, digital_note, sort_order";

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
  return productFormSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    summary: pickField(formData, "summary"),
    description: pickField(formData, "description"),
    category: pickField(formData, "category") || "Print",
    kind: pickField(formData, "kind") || "physical",
    priceInCents: pickField(formData, "priceInCents") || "0",
    status: pickField(formData, "status") || "placeholder",
    featured: booleanField(formData, "featured"),
    inStock: booleanField(formData, "inStock"),
    tags: arrayField(formData, "tags"),
    digitalNote: pickField(formData, "digitalNote"),
    imageAlt: pickField(formData, "imageAlt"),
    sortOrder: pickField(formData, "sortOrder") || "0",
  });
}

function toRow(parsed: z.infer<typeof productFormSchema>) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    summary: parsed.summary,
    description: parsed.description,
    category: parsed.category,
    kind: parsed.kind,
    price_in_cents: parsed.priceInCents,
    currency: "usd" as const,
    image_alt: parsed.imageAlt,
    status: parsed.status,
    featured: parsed.featured,
    in_stock: parsed.inStock,
    tags: parsed.tags,
    digital_note: parsed.digitalNote || null,
    sort_order: parsed.sortOrder,
  };
}

function revalidateShop(slug?: string) {
  revalidatePath("/(.*)/admin/shop", "page");
  revalidatePath("/(.*)/shop", "page");
  if (slug) revalidatePath(`/(.*)/shop/${slug}`, "page");
}

async function uploadIfPresent(
  formData: FormData,
  slug: string,
): Promise<{ path: string | null; error?: true }> {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadProductImage(file, slug);
    if (!upload) return { path: null, error: true };
    return { path: upload.path };
  }
  return { path: null };
}

export async function createProductAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof productFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  const upload = await uploadIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .insert({ ...toRow(parsed), image_path: upload.path });
  if (error) {
    if (upload.path) await deleteProductImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  revalidateShop(parsed.slug);
  redirect(`/admin/shop/${parsed.slug}`);
}

export async function updateProductAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof productFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  const supabase = await createSupabaseServerClient();
  const upload = await uploadIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  // Only overwrite image_path when a new file was uploaded; otherwise
  // keep the existing image.
  const patch = upload.path
    ? { ...toRow(parsed), image_path: upload.path }
    : toRow(parsed);

  // Grab the old path first so a successful re-upload can clean up.
  let oldPath: string | null = null;
  if (upload.path) {
    const { data } = await supabase
      .from("products")
      .select("image_path")
      .eq("id", id)
      .maybeSingle();
    oldPath = (data?.image_path as string | null | undefined) ?? null;
  }

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) {
    if (upload.path) await deleteProductImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  if (upload.path && oldPath && oldPath !== upload.path) {
    await deleteProductImage(oldPath);
  }

  revalidateShop(parsed.slug);
  return adminSuccess();
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("products")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();
  const imagePath = row?.image_path as string | null | undefined;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (imagePath) await deleteProductImage(imagePath);

  revalidateShop();
  redirect("/admin/shop");
}

export async function setProductStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").update({ status: parsed.data }).eq("id", id);
  revalidateShop();
}

export async function reorderProductAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
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
        supabase.from("products").update({ sort_order: position }).eq("id", row.id),
      ),
  );
  revalidateShop();
}

export async function bulkSetProductStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = STATUS.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").update({ status: parsed.data }).in("id", ids);
  revalidateShop();
}

export async function bulkDeleteProductsAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").delete().in("id", ids);
  revalidateShop();
}

export async function duplicateProductAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; title: string };

  // Find a free `<slug>-copy[-n]` slug.
  let slug = `${source.slug}-copy`.slice(0, 80);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 80);
    if (n > 50) return;
  }

  // Metadata-only copy — the image object is shared by reference, so we
  // null it on the copy to avoid two rows pointing at one storage object
  // (a later delete of one would orphan the other's image).
  const { error } = await supabase.from("products").insert({
    ...source,
    slug,
    title: `${source.title} (copy)`,
    status: "draft",
    image_path: null,
  });
  if (error) return;
  revalidateShop();
  redirect(`/admin/shop/${slug}`);
}
