import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { CartView } from "@/components/shop/cart-view";
import { getShopProductsSource } from "@/lib/shop/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tShop = await getTranslations({ locale, namespace: "Shop" });
  return {
    title: tShop("cartTitle"),
    alternates: buildAlternates(locale, "/shop/cart"),
    robots: { index: false },
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [tShop, products] = await Promise.all([
    getTranslations({ locale, namespace: "Shop" }),
    getShopProductsSource(),
  ]);

  return (
    <PageShell locale={locale}>
      <PageHero eyebrow={tShop("cartEyebrow")} title={tShop("cartTitle")} />
      <PageSection>
        <CartView locale={locale} products={products} />
      </PageSection>
    </PageShell>
  );
}
