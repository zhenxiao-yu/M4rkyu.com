import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { summarize } from "@/lib/content/summary";
import { getProjectsSource } from "@/lib/projects/source";
import { ProjectsClient } from "./_client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates(locale, "/work"),
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  const allProjects = await getProjectsSource();
  const summary = summarize(allProjects, (p) => p.contentStatus);
  const readyCount = summary.ready;
  const draftCount = summary.total - summary.ready;

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("intro")}
        decorativeWord="WORK"
      >
        <Card className="bg-background/70 shadow-lg shadow-black/5 backdrop-blur-xl hover:border-ring/50 dark:shadow-black/20">
          <CardHeader>
            <CardTitle>{t("archiveStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-mono text-foreground">{readyCount}</span>{" "}
              {t("production")}
            </p>
            <p>
              <span className="font-mono text-foreground">{draftCount}</span>{" "}
              {t("draft")}
            </p>
            <p>{t("noClaims")}</p>
          </CardContent>
        </Card>
      </PageHero>

      <PageSection>
        <ProjectsClient projects={allProjects} locale={locale} />
      </PageSection>
    </PageShell>
  );
}
