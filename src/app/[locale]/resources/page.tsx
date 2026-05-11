import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
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

export default async function ResourcesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Resources" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const categories = Array.from(new Set(resources.map((resource) => resource.category)));

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            as="h1"
            eyebrow={t("eyebrow")}
            title={tMeta("resourcesTitle")}
            description={tMeta("resourcesDescription")}
          />
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ResourcesClient resources={resources} categories={categories} />
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <EmptyArchiveState
          title={t("indexPendingTitle")}
          description={t("indexPendingDescription")}
        />
      </section>
    </PageShell>
  );
}
