import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { SearchClient } from "@/components/search/search-client";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildSearchCatalog } from "@/lib/search/catalog";

// The catalog is static content, so the page prerenders; the query lives in
// the client (?q=) behind Suspense, keeping the route statically generated.
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
    title: tMeta("searchTitle"),
    description: tMeta("searchDescription"),
    alternates: buildAlternates(locale, "/search"),
  };
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Search" });
  const catalog = await buildSearchCatalog();

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("heading")}
        description={t("subheading")}
        decorativeWord="SEARCH"
      />
      <PageSection>
        <Suspense fallback={null}>
          <SearchClient catalog={catalog} />
        </Suspense>
      </PageSection>
    </PageShell>
  );
}
