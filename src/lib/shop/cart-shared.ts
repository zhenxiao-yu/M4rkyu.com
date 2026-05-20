import { z } from "zod";
import type { Product } from "@/content/shop";

// Pure, server-safe cart logic. Shared by the client cart hook AND the
// server checkout route, which is the trust boundary: the client only
// ever stores { slug, quantity }; prices and product facts are always
// resolved from the catalog here, never taken from the client.

export const cartItemSchema = z.object({
  slug: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(99),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).max(50),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;

export const EMPTY_CART: Cart = { items: [] };

export interface ResolvedLine {
  product: Product;
  quantity: number;
  lineTotalInCents: number;
}

export interface ResolvedCart {
  lines: ResolvedLine[];
  subtotalInCents: number;
  itemCount: number;
  hasPhysical: boolean;
  hasDigital: boolean;
}

// Resolve cart items against the catalog. Drops items whose slug no
// longer maps to a ready product (e.g. removed/unpublished), and clamps
// quantity defensively. The returned subtotal is authoritative.
export function resolveCart(items: CartItem[], products: Product[]): ResolvedCart {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const lines: ResolvedLine[] = [];

  for (const item of items) {
    const product = bySlug.get(item.slug);
    if (!product || product.status !== "ready") continue;
    const quantity = Math.max(1, Math.min(99, Math.trunc(item.quantity)));
    lines.push({
      product,
      quantity,
      lineTotalInCents: product.priceInCents * quantity,
    });
  }

  return {
    lines,
    subtotalInCents: lines.reduce((sum, line) => sum + line.lineTotalInCents, 0),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    hasPhysical: lines.some((line) => line.product.kind === "physical"),
    hasDigital: lines.some((line) => line.product.kind === "digital"),
  };
}
