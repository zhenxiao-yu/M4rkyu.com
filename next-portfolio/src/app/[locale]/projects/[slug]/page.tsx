import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { MediaFrame } from "@/components/placeholders/media-frame";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
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
  const cover = project.screenshots[0];
  const sections = [
    [t("problem"), localized.problem as string],
    [t("solution"), localized.solution as string],
    [t("role"), localized.role as string],
    [t("outcome"), localized.outcome as string],
  ];
  const related = allProjects
    .filter((item) => item.slug !== project.slug && item.category === project.category)
    .slice(0, 2);

  return (
    <PageShell locale={locale}>
      <article>
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
          <div className="noise-layer absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
            <div>
              <Link href="/projects" locale={locale} className="text-sm text-muted-foreground hover:text-foreground">
                / projects
              </Link>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{project.category}</Badge>
                <Badge variant={project.featured ? "success" : "outline"}>{project.status}</Badge>
                {project.contentStatus !== "ready" ? <DraftBadge label={project.contentStatus} /> : null}
              </div>
              <h1 className="mt-5 max-w-5xl text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none text-balance">
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
                      <ArrowUpRight className="size-4" />
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
                {project.contentStatus !== "ready" ? (
                  <Button variant="outline" disabled>
                    Replace with final content
                  </Button>
                ) : null}
              </div>
            </div>

            <Card className="bg-background/70 backdrop-blur">
              <CardHeader>
                <ContentPendingLabel label="QUICK FACTS" />
                <CardTitle>{t("quickFacts")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Year:</span> {project.year}
                </p>
                <p>
                  <span className="text-muted-foreground">Category:</span> {project.category}
                </p>
                <p>
                  <span className="text-muted-foreground">Content:</span> {project.contentStatus}
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
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <MediaFrame eyebrow="hero media" label={cover ? "DRAFT COVER" : "MEDIA TBD"}>
            {cover ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted">
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>
            ) : (
              <PlaceholderImage label="PROJECT HERO MEDIA TBD" aspect="aspect-[16/10]" />
            )}
          </MediaFrame>
          <div className="grid gap-4">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Case-study status</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {project.contentStatus === "ready"
                  ? "Ready-marked content. Continue replacing media with final optimized assets."
                  : "Draft: this layout is production-shaped, but final copy, screenshots, outcomes, and lessons must replace placeholders."}
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Media checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  <li>Poster image: {cover ? "draft available" : "TBD"}</li>
                  <li>Screenshot set: TBD</li>
                  <li>Architecture diagram: TBD</li>
                  <li>Short video: optional, disabled by default</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            {sections.map(([title, body]) => (
              <Card key={title} className="content-auto bg-card/80">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-base leading-8 text-muted-foreground">{body}</CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>{t("features")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  {project.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>{t("architecture")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  {project.architectureNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  {project.challenges.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>{t("lessons")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  {project.lessonsLearned.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>{t("next")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  {project.nextSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold">Related work</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {related.length ? (
                related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/projects/${item.slug}`}
                    locale={locale}
                    className="rounded-lg border bg-card/80 p-5 transition-colors hover:border-ring"
                  >
                    <Badge variant="outline">{item.category}</Badge>
                    <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.shortPitch}</p>
                  </Link>
                ))
              ) : (
                <Card className="border-dashed bg-muted/30 md:col-span-2">
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    TBD: related work will appear after more final case studies are published.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
