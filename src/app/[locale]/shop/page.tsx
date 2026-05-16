import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

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
  const tShop = await getTranslations({ locale, namespace: "Shop" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tShop("eyebrow")}
        title={tMeta("shopTitle")}
        description={tMeta("shopDescription")}
        decorativeWord="SHOP"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <EmptyArchiveState
          title={tShop("pendingTitle")}
          description={tShop("pendingDescription")}
        />
      </PageSection>
    </PageShell>
  );
}
