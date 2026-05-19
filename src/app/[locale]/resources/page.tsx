import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { JsonLd } from "@/components/seo/json-ld";
import { FeaturedToolsBento } from "@/components/resources/featured-tools-bento";
import { LinksRail } from "@/components/resources/links-rail";
import { ResourcesExplorer } from "@/components/resources/resources-explorer";
import { ToolsMarquee } from "@/components/resources/tools-marquee";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildToolsCollectionJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("resourcesTitle"),
    description: tMeta("resourcesDescription"),
    alternates: buildAlternates(locale, "/resources"),
  };
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Resources" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  // Single canonical partition. Featured tools surface in the hero
  // bento; every tool also appears in the explorer below.
  const tools = resources.filter(
    (resource) => resource.type === "tool" && resource.status === "ready",
  );
  const featured = tools.filter((tool) => tool.featured);
  const links = resources.filter((resource) => resource.type === "link");

  return (
    <PageShell locale={locale}>
      <JsonLd data={buildToolsCollectionJsonLd(locale, tools)} />
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("resourcesTitle")}
        description={tMeta("resourcesDescription")}
        decorativeWord="TOOLS"
      />

      {featured.length > 0 ? (
        <PageSection innerClassName="pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10">
          <FeaturedToolsBento tools={featured} locale={locale} />
        </PageSection>
      ) : null}

      <PageSection innerClassName="py-8 sm:py-10 lg:py-12">
        <ResourcesExplorer tools={tools} locale={locale} />
      </PageSection>

      {links.length > 0 ? (
        <PageSection tone="muted" innerClassName="py-10 sm:py-12 lg:py-14">
          <LinksRail locale={locale} links={links} />
        </PageSection>
      ) : null}

      <ToolsMarquee tools={tools} locale={locale} />
    </PageShell>
  );
}
