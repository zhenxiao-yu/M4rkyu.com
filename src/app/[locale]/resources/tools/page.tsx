import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { FeaturedBentoRotator } from "@/components/resources/featured-bento-rotator";
import { ResourcesExplorer } from "@/components/resources/resources-explorer";
import { ToolsMarquee } from "@/components/resources/tools-marquee";
import { resources } from "@/content/resources";
import { Link } from "@/i18n/navigation";
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
    title: tMeta("resourcesToolsTitle"),
    description: tMeta("resourcesToolsDescription"),
    alternates: buildAlternates(locale, "/resources/tools"),
  };
}

export default async function ResourcesToolsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Resources" });

  const tools = resources.filter(
    (resource) => resource.type === "tool" && resource.status === "ready",
  );

  // Bento input. Featured tools first; if there aren't enough featured
  // entries for two pages of five, fold the rest of the catalog in so
  // the rotation stays interesting.
  const featured = tools.filter((tool) => tool.featured);
  const rest = tools.filter((tool) => !tool.featured);
  const bentoTools = [...featured, ...rest];

  const bentoItems = bentoTools.map((tool) => ({
    id: tool.slug,
    name: tool.name,
    description: tool.description,
    href: `/resources/${tool.slug}`,
    external: false,
    iconKey: tool.iconKey,
    tags: tool.tags,
    category: tool.category,
  }));

  return (
    <PageShell locale={locale}>
      <JsonLd data={buildToolsCollectionJsonLd(locale, tools)} />
      <PageHero
        eyebrow={t("ToolsPage.eyebrow")}
        title={t("ToolsPage.title")}
        description={t("ToolsPage.lede")}
        decorativeWord="TOOLS"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/resources" locale={locale}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("breadcrumbResources")}
            </Link>
          </Button>
        }
      />

      <PageSection innerClassName="pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10">
        <FeaturedBentoRotator
          items={bentoItems}
          locale={locale}
          labels={{
            eyebrow: t("Bento.toolsEyebrow"),
            heading: t("Bento.toolsHeading"),
            regionLabel: t("Bento.toolsRegionLabel"),
            prev: t("Bento.prev"),
            next: t("Bento.next"),
            pause: t("Bento.pause"),
            play: t("Bento.play"),
            collapse: t("Bento.collapse"),
            expand: t("Bento.expand"),
            openAria: t("openToolAria", { name: "{name}" }),
            gotoPage: t("Bento.gotoPage", { index: "{index}" }),
            typeBadge: t("type.tool"),
          }}
          collapseStorageKey="m4rkyu:resources:bento-tools-collapsed"
        />
      </PageSection>

      <PageSection innerClassName="py-8 sm:py-10 lg:py-12">
        <ResourcesExplorer tools={tools} locale={locale} />
      </PageSection>

      <ToolsMarquee tools={tools} locale={locale} />
    </PageShell>
  );
}
