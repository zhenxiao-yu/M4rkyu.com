import "server-only";

import { mediaItems } from "@/content/media";
import { resources } from "@/content/resources";
import { notes } from "@/content/notes";
import { products } from "@/content/shop";
import type { MediaItem, Resource, Note } from "@/content/schemas";
import type { Product } from "@/content/shop";
import { tiersToText } from "@/lib/notes/tiers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { insertNewBySlug } from "../insert-new";
import type { ImportReport } from "../types";

export function staticMediaToRow(m: MediaItem): Record<string, unknown> {
  return {
    slug: m.slug, title: m.title, format: m.format, status: "draft",
    description: m.description, duration: m.duration ?? null,
    poster_path: m.poster?.src ?? null, poster_alt: m.poster?.alt ?? "", sort_order: 0,
  };
}

export function staticResourceToRow(r: Resource): Record<string, unknown> {
  return {
    slug: r.slug, name: r.name, category: r.category, description: r.description,
    why: r.why, type: r.type, link: r.link, pricing: r.pricing, tags: r.tags,
    status: "draft", featured: r.featured, icon_key: r.iconKey ?? null, sort_order: 0,
  };
}

export function staticNoteToRow(n: Note): Record<string, unknown> {
  return {
    slug: n.slug, kind: n.kind, title: n.title, body: n.body, status: "draft",
    tags: n.tags, published_at: n.publishedAt,
    link_url: n.link?.url ?? null, link_label: n.link?.label ?? null,
    // `tiers` is a newline/colon authored text column (see parseTiers);
    // tiersToText is its exact inverse — NOT JSON.
    rating: n.rating ?? null, tiers: tiersToText(n.tiers ?? []), sort_order: 0,
  };
}

export function staticProductToRow(p: Product): Record<string, unknown> {
  return {
    slug: p.slug, title: p.title, summary: p.summary, description: p.description,
    category: p.category, kind: p.kind, price_in_cents: p.priceInCents, currency: p.currency,
    image_path: p.image?.src ?? null, image_alt: p.image?.alt ?? "", status: "draft",
    featured: p.featured, in_stock: p.inStock, tags: p.tags,
    digital_note: p.digitalNote ?? null, sort_order: 0,
  };
}

async function importSimple<T extends { slug: string }>(
  section: string,
  table: string,
  items: T[],
  toRow: (t: T) => Record<string, unknown>,
  dryRun: boolean,
): Promise<ImportReport> {
  const supabase = await createSupabaseServerClient();
  const result = await insertNewBySlug(supabase, table, items, (t) => t.slug, toRow, dryRun);
  return {
    section,
    totalStatic: items.length,
    inserted: result.inserted,
    skipped: result.skippedSlugs.length,
    skippedSlugs: result.skippedSlugs,
  };
}

export const importMedia = (dryRun: boolean) =>
  importSimple("media", "media_items", mediaItems, staticMediaToRow, dryRun);
export const importResources = (dryRun: boolean) =>
  importSimple("resources", "resources", resources, staticResourceToRow, dryRun);
export const importNotes = (dryRun: boolean) =>
  importSimple("notes", "notes", notes, staticNoteToRow, dryRun);
export const importShop = (dryRun: boolean) =>
  importSimple("shop", "products", products, staticProductToRow, dryRun);
