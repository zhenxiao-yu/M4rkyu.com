import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tShop = await getTranslations({ locale, namespace: "Shop" });
  return {
    title: tShop("cancelTitle"),
    robots: { index: false },
  };
}

export default async function ShopCancelPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const tShop = await getTranslations({ locale, namespace: "Shop" });

  return (
    <PageShell locale={locale}>
      <PageHero eyebrow={tShop("cancelEyebrow")} title={tShop("cancelTitle")} />
      <PageSection width="narrow">
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          {tShop("cancelDescription")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/shop/cart">{tShop("backToCart")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">{tShop("continueShopping")}</Link>
          </Button>
        </div>
      </PageSection>
    </PageShell>
  );
}
