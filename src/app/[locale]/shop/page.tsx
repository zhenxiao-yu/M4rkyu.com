import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { CartButton } from "@/components/shop/cart-button";
import { ProductCard } from "@/components/shop/product-card";
import { getShopProductsSource } from "@/lib/shop/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("shopTitle"),
    description: tMeta("shopDescription"),
    alternates: buildAlternates(locale, "/shop"),
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tShop = await getTranslations({ locale, namespace: "Shop" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const products = await getShopProductsSource();
  const featured = products.filter((product) => product.featured);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tShop("eyebrow")}
        title={tMeta("shopTitle")}
        description={tMeta("shopDescription")}
        decorativeWord="SHOP"
        actions={<CartButton />}
      />

      {products.length === 0 ? (
        <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
          <EmptyArchiveState
            title={tShop("emptyTitle")}
            description={tShop("emptyDescription")}
          />
        </PageSection>
      ) : (
        <>
          {featured.length > 0 ? (
            <PageSection tone="muted">
              <SectionHeading
                eyebrow={tShop("featuredEyebrow")}
                title={tShop("featuredTitle")}
              />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((product) => (
                  <ProductCard key={product.slug} product={product} locale={locale} />
                ))}
              </div>
            </PageSection>
          ) : null}

          <PageSection>
            <SectionHeading
              eyebrow={tShop("catalogEyebrow")}
              title={tShop("catalogTitle")}
              description={tShop("catalogDescription")}
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} locale={locale} />
              ))}
            </div>
          </PageSection>
        </>
      )}
    </PageShell>
  );
}
