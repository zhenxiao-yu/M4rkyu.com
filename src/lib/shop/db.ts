import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseReadClient } from "@/lib/supabase/read";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { env } from "@/lib/env";
import { type Product, productSchema } from "@/content/shop";

// DB-backed product reads. Wrapped in React cache() so multiple callers
// per render hit Supabase once. All return arrays — never null — so
// callers can fall back cleanly to src/content/shop.ts when the table
// is empty.

export interface DbProductRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  kind: Product["kind"];
  price_in_cents: number;
  currency: "usd";
  image_path: string | null;
  image_alt: string;
  status: Product["status"];
  featured: boolean;
  in_stock: boolean;
  tags: string[];
  digital_note: string | null;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, title, summary, description, category, kind, price_in_cents, currency, image_path, image_alt, status, featured, in_stock, tags, digital_note, sort_order";

export function storageUrlFor(path: string | null): string | null {
  if (!path) return null;
  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/shop-images/${path}`;
}

// `createSupabaseServerClient` reads request cookies, which throws when
// Next enumerates generateStaticParams / sitemap at build time (no
// request context). We try/catch and fall back to an empty result —
// `getProductsSource` then returns the static `products` array.
export const getDbProducts = cache(async (): Promise<DbProductRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(SELECT_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DbProductRow[];
  } catch {
    return [];
  }
});

export const getDbProductBySlug = cache(
  async (slug: string): Promise<DbProductRow | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as DbProductRow;
    } catch {
      return null;
    }
  },
);

// Cookieless public twins of the reads above. These use the anon read
// client (no `cookies()`), so the storefront + product pages can be
// statically rendered / ISR. RLS (`status = 'ready' OR is_admin`) means
// an anon read returns ONLY ready rows — correct for the public store and
// for checkout price resolution (only ready products are purchasable).
// The cookie-bound `getDbProducts` above stays for admin (drafts).
export const getPublicDbProducts = cache(async (): Promise<DbProductRow[]> => {
  const supabase = createSupabaseReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as DbProductRow[];
});

export const getPublicDbProductBySlug = cache(
  async (slug: string): Promise<DbProductRow | null> => {
    const supabase = createSupabaseReadClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("products")
      .select(SELECT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as DbProductRow;
  },
);

// Map a DB row to the Product shape consumed by the storefront +
// checkout. Re-parsed through the Zod schema so the contract is
// identical to the static catalog (defaults, currency literal, etc).
export function dbProductRowToProduct(row: DbProductRow): Product {
  const src = storageUrlFor(row.image_path);
  return productSchema.parse({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    kind: row.kind,
    priceInCents: row.price_in_cents,
    currency: "usd",
    image: src ? { src, alt: row.image_alt || row.title } : undefined,
    gallery: [],
    status: row.status,
    featured: row.featured,
    inStock: row.in_stock,
    tags: row.tags ?? [],
    digitalNote: row.digital_note ?? undefined,
  });
}
