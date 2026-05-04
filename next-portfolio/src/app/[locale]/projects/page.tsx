import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/cards/project-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { allProjects } from "@/content/projects";
import type { Locale } from "@/i18n/routing";

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
    alternates: { canonical: `/${locale}/projects` },
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  const categories = [
    "Featured",
    "Web Apps",
    "Game Dev",
    "AI Tools",
    "Art/Film",
    "Experiments",
    "Archived",
    "Drafts",
  ];
  const readyCount = allProjects.filter((project) => project.contentStatus === "ready").length;
  const draftCount = allProjects.length - readyCount;

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          <SectionHeading
            eyebrow="work index"
            title={t("title")}
            description={`${t("intro")} Draft and placeholder entries are intentionally marked until final copy, media, and outcomes are approved.`}
          />
          <Card className="bg-background/70 backdrop-blur">
            <CardHeader>
              <ContentPendingLabel label="ARCHIVE STATUS" />
              <CardTitle>Prototype content map</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>{readyCount} ready-marked entries</p>
              <p>{draftCount} draft or placeholder entries</p>
              <p>No fake clients, awards, or metrics are included.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={category} variant={index === 0 ? "success" : "outline"}>
                {category}
              </Badge>
            ))}
          </div>
          <label className="grid gap-2 text-sm text-muted-foreground">
            Search
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
              <Input className="pl-9" placeholder="Placeholder search; Pagefind follows later" />
            </span>
          </label>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <EmptyArchiveState
          title="Maintenance and archived lane"
          description="Placeholder empty state: archived projects will appear here after the final content audit."
        />
      </section>
    </PageShell>
  );
}
