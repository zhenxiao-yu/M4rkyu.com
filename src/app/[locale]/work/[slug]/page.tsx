import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { ProjectCartridge } from "@/components/ui/pixel/project-cartridge";
import {
  CaseStudyList,
  CaseStudySection,
} from "@/components/case-study/case-study-section";
import { PullQuoteBlock } from "@/components/case-study/pull-quote-block";
import { CaseStudyFooter } from "@/components/case-study/case-study-footer";
import { allProjects, getProject } from "@/content/projects";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/content/localize";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";

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
    alternates: buildAlternates(locale, `/work/${slug}`),
  };
}

const eyebrowMono =
  "font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const tProjects = await getTranslations({ locale, namespace: "Projects" });
  const tCase = await getTranslations({ locale, namespace: "CaseStudy" });
  const tCategories = await getTranslations({
    locale,
    namespace: "Categories",
  });
  const localized = localize(project, locale);
  const cover = project.screenshots[0];
  const processShots = project.screenshots.slice(1, 9);

  // Adjacent navigation in archive order — predictable, no clever sort.
  const projectIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const prevProject = projectIndex > 0 ? allProjects[projectIndex - 1] : undefined;
  const nextProject =
    projectIndex < allProjects.length - 1
      ? allProjects[projectIndex + 1]
      : undefined;
  const prev = prevProject
    ? {
        href: `/work/${prevProject.slug}`,
        title: prevProject.title,
        pitch: prevProject.shortPitch,
      }
    : undefined;
  const next = nextProject
    ? {
        href: `/work/${nextProject.slug}`,
        title: nextProject.title,
        pitch: nextProject.shortPitch,
      }
    : undefined;

  const related = allProjects
    .filter(
      (item) => item.slug !== project.slug && item.category === project.category,
    )
    .slice(0, 2);

  return (
    <PageShell locale={locale}>
      <article>
        <ProjectCartridge
          project={project}
          locale={locale}
          title={localized.title}
          shortPitch={localized.shortPitch as string}
          role={localized.role as string}
        />

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <BlurFade>
            <figure className="relative aspect-16/10 overflow-hidden rounded-lg border bg-muted">
              {cover ? (
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 1100px, 100vw"
                  className="object-cover"
                />
              ) : (
                <PlaceholderImage
                  label="PROJECT HERO MEDIA TBD"
                  aspect="h-full"
                  className="rounded-none border-0"
                />
              )}
            </figure>
          </BlurFade>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <BlurFade>
              <CaseStudySection
                eyebrow={tCase("context")}
                title={tProjects("problem")}
              >
                <p>{localized.problem as string}</p>
              </CaseStudySection>
            </BlurFade>
            <BlurFade delay={0.1}>
              <CaseStudySection
                eyebrow={tCase("approach")}
                title={tProjects("solution")}
              >
                <p>{localized.solution as string}</p>
              </CaseStudySection>
            </BlurFade>
          </div>
        </section>

        <section className="border-y bg-muted/20">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            <BlurFade>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{tProjects("features")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CaseStudyList items={project.features} />
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.08}>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{tProjects("architecture")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CaseStudyList items={project.architectureNotes} />
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.16}>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{tCase("challenges")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CaseStudyList items={project.challenges} />
                </CardContent>
              </Card>
            </BlurFade>
          </div>
        </section>

        {processShots.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <BlurFade>
              <h2 className={eyebrowMono}>{tCase("process")}</h2>
            </BlurFade>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {processShots.map((shot, index) => (
                <BlurFade key={`${index}-${shot.src}`} delay={0.05 * index}>
                  <figure className="relative aspect-4/3 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 768px) 540px, 100vw"
                      className="object-cover"
                    />
                  </figure>
                </BlurFade>
              ))}
            </div>
          </section>
        ) : null}

        {project.outcome ? (
          <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <BlurFade>
              <PullQuoteBlock
                eyebrow={tCase("outcomeEyebrow")}
                quote={localized.outcome as string}
              />
            </BlurFade>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {project.lessonsLearned.length > 0 ? (
              <BlurFade>
                <CaseStudySection
                  eyebrow={tCase("lessonsEyebrow")}
                  title={tProjects("lessons")}
                >
                  <CaseStudyList items={project.lessonsLearned} numbered />
                </CaseStudySection>
              </BlurFade>
            ) : null}
            {project.nextSteps.length > 0 ? (
              <BlurFade delay={0.1}>
                <CaseStudySection
                  eyebrow={tCase("nextEyebrow")}
                  title={tProjects("next")}
                >
                  <CaseStudyList items={project.nextSteps} numbered />
                </CaseStudySection>
              </BlurFade>
            ) : null}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="border-t bg-muted/20">
            <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <h2 className={eyebrowMono}>{tCase("relatedWork")}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/work/${item.slug}`}
                    className={cn(
                      "group rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
                      FOCUS_RING,
                    )}
                  >
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {tCategories(item.category)}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {item.shortPitch}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <CaseStudyFooter prev={prev} next={next} archiveHref="/work" />
      </article>
    </PageShell>
  );
}
