import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { ResourcesClient } from "./_client";

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
  const categories = Array.from(
    new Set(resources.map((resource) => resource.category)),
  );

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("resourcesTitle")}
        description={tMeta("resourcesDescription")}
        decorativeWord="TOOLS"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <ResourcesClient resources={resources} categories={categories} />
      </PageSection>
      <PageSection innerClassName="pt-0">
        <EmptyArchiveState
          title={t("indexPendingTitle")}
          description={t("indexPendingDescription")}
        />
      </PageSection>
    </PageShell>
  );
}
