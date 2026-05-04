import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/cards/project-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const categories = ["Featured", "Web Apps", "Game Dev", "AI Tools", "Art/Film", "Experiments"];

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="work index" title={t("title")} description={t("intro")} />
        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant={category === "Featured" ? "success" : "outline"}>
                {category}
              </Badge>
            ))}
          </div>
          <label className="grid gap-2 text-sm text-muted-foreground">
            Search
            <Input placeholder="Static search placeholder; Pagefind follows later" />
          </label>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
