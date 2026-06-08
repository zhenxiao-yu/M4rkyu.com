import { z } from "zod";
import { contentStatusSchema, imageSchema } from "./schemas";

// Shop catalog. The schema is real and is the server-side source of
// truth for pricing at checkout (the client only ever sends slug +
// quantity). The product copy + images here are placeholder data —
// swap in real prints/objects when the shop opens. Money is integer
// minor units (cents) to avoid float drift, mirroring Stripe.

export const productSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(1)
    .max(80),
  title: z.string().min(1).max(160),
  // One-line pitch for cards + the cart line item.
  summary: z.string().min(1).max(280),
  // Long-form detail for the product page (optional).
  description: z.string().default(""),
  category: z.string().min(1),
  // Physical goods collect a shipping address at checkout; digital goods
  // do not. A mixed cart collects shipping when any physical item is in
  // it.
  kind: z.enum(["physical", "digital"]),
  priceInCents: z.number().int().nonnegative(),
  currency: z.literal("usd").default("usd"),
  image: imageSchema.optional(),
  gallery: z.array(imageSchema).default([]),
  status: contentStatusSchema.default("placeholder"),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  // Shown on digital products near the buy button.
  digitalNote: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const products: Product[] = [
  {
    slug: "contact-sheet-01-print",
    title: "Contact Sheet 01 — Archival Print",
    summary: "A2 archival giclée print on cotton rag. Edition of 25.",
    description:
      "Placeholder copy. Replace with the real print description: paper stock, edition size, signing details, and shipping/handling notes. Printed to order; allow 1–2 weeks.",
    category: "Print",
    kind: "physical",
    priceInCents: 8500,
    currency: "usd",
    status: "draft",
    featured: false,
    inStock: true,
    tags: ["print", "black-and-white", "edition"],
  },
  {
    slug: "city-nights-poster",
    title: "City Nights — Poster",
    summary: "B1 matte poster. Open edition.",
    description:
      "Placeholder copy. Describe the poster: size, finish, and framing suggestions.",
    category: "Poster",
    kind: "physical",
    priceInCents: 4500,
    currency: "usd",
    status: "draft",
    featured: false,
    inStock: true,
    tags: ["poster", "color"],
  },
  {
    slug: "process-zine",
    title: "Process Zine — Risograph",
    summary: "32-page risograph zine. Hand-bound.",
    description:
      "Placeholder copy. Describe the zine contents, paper, and binding.",
    category: "Object",
    kind: "physical",
    priceInCents: 2200,
    currency: "usd",
    status: "draft",
    inStock: true,
    tags: ["zine", "riso"],
  },
  {
    slug: "wallpaper-pack",
    title: "Desktop Wallpaper Pack",
    summary: "12 high-resolution wallpapers. Instant download.",
    description:
      "Placeholder copy. List the resolutions, formats, and license terms for the download.",
    category: "Digital",
    kind: "digital",
    priceInCents: 900,
    currency: "usd",
    status: "draft",
    featured: false,
    inStock: true,
    tags: ["digital", "wallpaper"],
    digitalNote: "Download link is emailed after purchase.",
  },
  {
    slug: "lightroom-presets",
    title: "Mono Film Presets",
    summary: "A 10-preset black-and-white pack for Lightroom.",
    description:
      "Placeholder copy. Describe the presets, compatibility, and install steps.",
    category: "Digital",
    kind: "digital",
    priceInCents: 1500,
    currency: "usd",
    status: "draft",
    inStock: true,
    tags: ["digital", "presets"],
    digitalNote: "Download link is emailed after purchase.",
  },
  {
    slug: "studio-sticker-set",
    title: "Studio Sticker Set",
    summary: "Die-cut vinyl sticker set of 6.",
    description: "Placeholder copy. Describe the sticker set.",
    category: "Object",
    kind: "physical",
    priceInCents: 1200,
    currency: "usd",
    status: "draft",
    inStock: false,
    tags: ["stickers"],
  },
].map((product) => productSchema.parse(product));

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

// Public surface shows only ready products; drafts/placeholders stay
// out of the storefront + sitemap (mirrors the rest of the content layer).
export function getShopProducts(): Product[] {
  return products.filter((product) => product.status === "ready");
}
