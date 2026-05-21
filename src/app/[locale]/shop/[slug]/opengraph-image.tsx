import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import { getProductFromSource, getShopProductsSource } from "@/lib/shop/source";
import { formatPrice } from "@/lib/shop/format";
import { routing } from "@/i18n/routing";

export const alt = "Shop — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Pre-declare one OG per (locale, slug) so Next can statically generate
// the branded product card at build time.
export async function generateImageMetadata() {
  const products = await getShopProductsSource();
  return products.flatMap((product) =>
    routing.locales.map((locale) => ({
      id: `${locale}-${product.slug}`,
      alt: `${product.title} — shop`,
      contentType: OG_CONTENT_TYPE,
      size: OG_IMAGE_SIZE,
    })),
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductFromSource(slug);
  if (!product) notFound();
  return await renderOgImage({
    eyebrow: "SHOP",
    title: product.title,
    subtitle: `${formatPrice(product.priceInCents, "en", product.currency)} · ${product.summary}`,
    footer: `m4rkyu.com / shop / ${product.slug}`,
  });
}
