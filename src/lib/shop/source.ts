import "server-only";

import { cache } from "react";
import { getShopProducts as getStaticShopProducts } from "@/content/shop";
import { dbProductRowToProduct, getDbProducts } from "@/lib/shop/db";
import type { Product } from "@/content/shop";

// Unified read of shop products — DB first, static src/content/shop.ts
// as zero-downtime fallback. The storefront, product pages, checkout
// price resolution, and webhook fulfillment all consume this and never
// see the underlying source.
//
// Cutover: as soon as the products table has ≥1 row, the public surface
// (and authoritative pricing) flips to DB-backed reads. Until then, the
// static array remains authoritative. Only `ready` products are ever
// exposed — drafts/placeholders stay out of the storefront, the cart,
// and checkout, exactly like the static `getShopProducts()`.

export const getShopProductsSource = cache(async (): Promise<Product[]> => {
  const rows = await getDbProducts();
  if (rows.length === 0) return getStaticShopProducts();
  return rows.map(dbProductRowToProduct).filter((p) => p.status === "ready");
});

export const getProductFromSource = cache(
  async (slug: string): Promise<Product | undefined> => {
    const products = await getShopProductsSource();
    return products.find((p) => p.slug === slug);
  },
);
