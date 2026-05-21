import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { AddToCart } from "@/components/shop/add-to-cart";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { getShopProducts } from "@/content/shop";
import { getProductFromSource } from "@/lib/shop/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildProductJsonLd } from "@/lib/seo/structured-data";
import { formatPrice } from "@/lib/shop/format";

export function generateStaticParams() {
  return getShopProducts().flatMap((product) => [
    { locale: "en", slug: product.slug },
    { locale: "zh", slug: product.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductFromSource(slug);
  if (!product || product.status !== "ready") return {};
  return {
    title: product.title,
    description: product.summary,
    alternates: buildAlternates(locale, `/shop/${slug}`),
    openGraph: product.image
      ? { images: [{ url: product.image.src, alt: product.image.alt }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductFromSource(slug);
  if (!product || product.status !== "ready") notFound();

  const t = await getTranslations({ locale, namespace: "Shop" });
  const gallery = product.image
    ? [product.image, ...product.gallery]
    : product.gallery;

  return (
    <PageShell locale={locale}>
      <JsonLd data={buildProductJsonLd(product, locale)} />
      <PageSection innerClassName="pt-28 sm:pt-32">
        <BlurFade>
          <Button asChild variant="ghost" size="sm" className="mb-8 -ml-3">
            <Link href="/shop">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("backToShop")}
            </Link>
          </Button>
        </BlurFade>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <BlurFade className="grid gap-4">
            <div className="relative aspect-4/5 overflow-hidden rounded-lg border bg-muted">
              {gallery[0] ? (
                <Image
                  src={gallery[0].src}
                  alt={gallery[0].alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <PlaceholderImage
                  label={product.category}
                  aspect="h-full"
                  className="rounded-none border-0"
                />
              )}
            </div>
            {gallery.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(1, 5).map((shot) => (
                  <div
                    key={shot.src}
                    className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </BlurFade>

          <BlurFade delay={0.1} className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant={product.kind === "digital" ? "signal" : "default"}>
                {product.kind === "digital" ? t("digital") : t("physical")}
              </Badge>
              {!product.inStock ? (
                <Badge variant="warning">{t("soldOut")}</Badge>
              ) : null}
            </div>

            <h1 className="text-3xl font-[700] leading-[1.05] tracking-normal text-balance sm:text-4xl">
              {product.title}
            </h1>

            <p className="font-mono text-2xl font-semibold text-foreground">
              {formatPrice(product.priceInCents, locale, product.currency)}
            </p>

            <p className="text-base leading-7 text-muted-foreground">{product.summary}</p>

            {product.description ? (
              <p className="text-sm leading-7 text-muted-foreground">
                {product.description}
              </p>
            ) : null}

            {product.kind === "digital" && product.digitalNote ? (
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {product.digitalNote}
              </p>
            ) : null}

            <div className="mt-2 flex flex-col gap-3">
              <AddToCart slug={product.slug} inStock={product.inStock} withQuantity />
              <Button asChild variant="link" className="self-start">
                <Link href="/shop/cart">{t("viewCart")}</Link>
              </Button>
            </div>
          </BlurFade>
        </div>
      </PageSection>
    </PageShell>
  );
}
