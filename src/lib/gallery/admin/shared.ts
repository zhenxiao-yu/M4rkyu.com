import { revalidatePath } from "next/cache";
import { z } from "zod";

// Shared, NON-action helpers for the gallery admin server actions. This
// file deliberately omits "use server" so it can export plain values
// (zod schemas, constants, pure utilities) that a Server Actions module
// is not allowed to export. The collection/item action modules import
// from here.

export const SLUG_RE = /^[a-z0-9-]+$/;
export const STATUS_ENUM = z.enum([
  "ready",
  "draft",
  "placeholder",
  "coming-soon",
]);
export const ITEM_TYPE_ENUM = z.enum(["image", "contact-sheet", "process"]);
export const ASPECT_ENUM = z.enum(["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"]);

export const collectionSchema = z.object({
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(80),
  title: z.string().min(1).max(120),
  description: z.string().max(600).default(""),
  status: STATUS_ENUM.default("draft"),
  sortOrder: z.coerce.number().int().default(0),
  featured: z.coerce.boolean().default(false),
  coverAlt: z.string().max(240).default(""),
});

export const itemSchema = z.object({
  collectionId: z.string().uuid(),
  slug: z.string().regex(SLUG_RE, "lowercase letters, numbers, hyphens").min(1).max(100),
  title: z.string().min(1).max(160),
  caption: z.string().max(1000).default(""),
  type: ITEM_TYPE_ENUM.default("image"),
  status: STATUS_ENUM.default("draft"),
  alt: z.string().max(240).default(""),
  aspect: ASPECT_ENUM.default("4/5"),
  capturedAt: z.string().optional(),
  location: z.string().optional(),
  featured: z.coerce.boolean().default(false),
  pinned: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  width: z.coerce.number().int().positive().max(60000).optional(),
  height: z.coerce.number().int().positive().max(60000).optional(),
  blurDataUrl: z.string().max(20000).optional(),
});

export const COLLECTION_COLUMNS =
  "slug, title, description, status, sort_order, featured, cover_path, cover_alt, mood";

export function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function booleanField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function parseCollection(formData: FormData) {
  return collectionSchema.parse({
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    description: pickField(formData, "description"),
    status: pickField(formData, "status") || "draft",
    sortOrder: pickField(formData, "sortOrder") || "0",
    featured: booleanField(formData, "featured"),
    coverAlt: pickField(formData, "coverAlt"),
  });
}

export function collectionToRow(parsed: z.infer<typeof collectionSchema>) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    description: parsed.description,
    status: parsed.status,
    sort_order: parsed.sortOrder,
    featured: parsed.featured,
    cover_alt: parsed.coverAlt || null,
  };
}

export function parseItem(formData: FormData) {
  return itemSchema.parse({
    collectionId: pickField(formData, "collectionId"),
    slug: pickField(formData, "slug"),
    title: pickField(formData, "title"),
    caption: pickField(formData, "caption"),
    type: pickField(formData, "type") || "image",
    status: pickField(formData, "status") || "draft",
    alt: pickField(formData, "alt"),
    aspect: pickField(formData, "aspect") || "4/5",
    capturedAt: pickField(formData, "capturedAt") || undefined,
    location: pickField(formData, "location") || undefined,
    featured: booleanField(formData, "featured"),
    pinned: booleanField(formData, "pinned"),
    sortOrder: pickField(formData, "sortOrder") || "0",
    width: pickField(formData, "width") || undefined,
    height: pickField(formData, "height") || undefined,
    blurDataUrl: pickField(formData, "blurDataUrl") || undefined,
  });
}

export function revalidateGallery(slug?: string) {
  revalidatePath("/(.*)/admin/gallery", "page");
  revalidatePath("/(.*)/archive", "page");
  if (slug) revalidatePath(`/(.*)/archive/${slug}`, "page");
}

// Batch insert for the drag-a-folder uploader. The browser uploads the
// (optimized) files straight to storage — bypassing the server-action body
// limit — then hands us the resulting paths + metadata to row-insert in one
// shot. Slugs are de-collided against the collection's existing items.
export const batchItemSchema = z.object({
  path: z.string().min(1).max(300),
  slug: z.string().regex(SLUG_RE).min(1).max(100),
  title: z.string().min(1).max(160),
  width: z.coerce.number().int().positive().max(60000).optional(),
  height: z.coerce.number().int().positive().max(60000).optional(),
  blurDataUrl: z.string().max(20000).optional(),
  aspect: ASPECT_ENUM.optional(),
  capturedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
