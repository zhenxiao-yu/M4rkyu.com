import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { allProjects, getProject } from "@/content/projects";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/content/localize";

export function generateStaticParams() {
  return allProjects.flatMap((project) => [
    { locale: "en", slug: project.slug },
    { locale: "zh", slug: project.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.seo.title,
    description: project.seo.description,
    alternates: { canonical: `/${locale}/projects/${slug}` },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: "Projects" });
  const localized = localize(project, locale);

  const sections = [
    [t("problem"), localized.problem],
    [t("solution"), localized.solution],
    [t("role"), localized.role],
    [t("outcome"), localized.outcome],
  ];

  return (
    <PageShell locale={locale}>
      <article className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/projects" locale={locale} className="text-sm text-muted-foreground hover:text-foreground">
          / projects
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <Badge variant="success">{project.status}</Badge>
            <h1 className="mt-5 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none">
              {localized.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground">
              {localized.shortPitch as string}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl ? (
                <Button asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    {t("live")}
                  </a>
                </Button>
              ) : null}
              {project.githubUrl ? (
                <Button asChild variant="outline">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    {t("source")}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("quickFacts")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p>
                <span className="text-muted-foreground">Year:</span> {project.year}
              </p>
              <p>
                <span className="text-muted-foreground">Category:</span> {project.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-14 grid gap-5">
          {sections.map(([title, body]) => (
            <Card key={title as string}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-8 text-muted-foreground">{body as string}</CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle>{t("features")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-muted-foreground md:grid-cols-2">
                {project.features.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("architecture")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-muted-foreground">
                {project.architectureNotes.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </article>
    </PageShell>
  );
}
