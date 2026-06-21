import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { BlurImage } from "@/components/ui/blur-image";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { ProjectCartridge } from "@/components/ui/pixel/project-cartridge";
import {
  CaseStudyList,
} from "@/components/case-study/case-study-section";
import { PullQuoteBlock } from "@/components/case-study/pull-quote-block";
import { CaseStudyFooter } from "@/components/case-study/case-study-footer";
import { SpecRail, type SpecRailSection } from "@/components/case-study/spec-rail";
import {
  ScreenshotGallery,
  type GalleryShot,
} from "@/components/case-study/screenshot-gallery";
import { TechStackPanel } from "@/components/case-study/tech-stack-panel";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/content/localize";
import { buildAlternates } from "@/lib/seo/alternates";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildProjectJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";
import {
  getProjectFromSource,
  getProjectsSource,
} from "@/lib/projects/source";
import { cn, FOCUS_RING } from "@/lib/utils";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjectsSource();
  return projects.flatMap((project) => [
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
  const project = await getProjectFromSource(slug);
  if (!project) return {};
  return {
    title: project.seo.title,
    description: project.seo.description,
    alternates: buildAlternates(locale, `/work/${slug}`),
  };
}

const eyebrowMono =
  "font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground";

/** Anchored, numbered section shell — shared rhythm + permalink affordance. */
function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="group scroll-mt-24 border-t border-border/60 pt-10 first:border-t-0 first:pt-0"
    >
      <BlurFade>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {index}
          </span>
          <h2 className="text-2xl font-semibold leading-snug text-balance sm:text-3xl">
            {title}
          </h2>
          <a
            href={`#${id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="font-mono text-sm text-muted-foreground opacity-0 transition-opacity duration-(--motion-fast) [@media(pointer:fine)]:group-hover:opacity-50"
          >
            #
          </a>
        </div>
      </BlurFade>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [project, tProjects, tCase] = await Promise.all([
    getProjectFromSource(slug),
    getTranslations({ locale, namespace: "Projects" }),
    getTranslations({ locale, namespace: "CaseStudy" }),
  ]);
  if (!project) notFound();
  const [tNav, tCategories] = await Promise.all([
    getTranslations({ locale, namespace: "Navigation" }),
    getTranslations({ locale, namespace: "Categories" }),
  ]);
  const localized = localize(project, locale);
  const cover = project.screenshots[0];
  const galleryShots: GalleryShot[] = project.screenshots
    .slice(1)
    .map((shot) => ({
      src: shot.src,
      alt: shot.alt,
      label: shot.label,
      caption: shot.caption,
      width: shot.width,
      height: shot.height,
    }));

  const tagline = (localized.tagline as string) || (localized.shortPitch as string);
  const hasFeatures = project.features.length > 0;
  const hasBuild =
    project.architectureNotes.length > 0 || project.challenges.length > 0;
  const hasRoadmap =
    project.lessonsLearned.length > 0 || project.nextSteps.length > 0;
  const hasGallery = galleryShots.length > 0;

  // TOC + numbering are derived from which sections actually render.
  const toc: SpecRailSection[] = [
    { id: "overview", label: tCase("overview") },
    ...(hasGallery ? [{ id: "screens", label: tCase("screenshots") }] : []),
    { id: "stack", label: tCase("builtWith") },
    ...(hasFeatures ? [{ id: "highlights", label: tCase("highlights") }] : []),
    ...(hasBuild ? [{ id: "build", label: tCase("underTheHood") }] : []),
    ...(project.outcome ? [{ id: "outcome", label: tCase("outcomeEyebrow") }] : []),
    ...(hasRoadmap ? [{ id: "roadmap", label: tCase("roadmap") }] : []),
  ];
  const indexOf = (id: string) =>
    String(toc.findIndex((s) => s.id === id) + 1).padStart(2, "0");

  // Spec-sheet facts — role always; timeline/platforms only when present.
  const facts = [
    { label: tProjects("role"), value: localized.role as string },
    ...(project.timeline
      ? [{ label: tCase("timeline"), value: project.timeline }]
      : []),
    ...(project.platforms.length > 0
      ? [{ label: tCase("platforms"), value: project.platforms.join(" · ") }]
      : []),
  ];

  // Adjacent navigation in archive order — predictable, no clever sort.
  const allProjects = await getProjectsSource();
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
      <JsonLd data={buildProjectJsonLd(project, locale)} />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: tNav("work"), path: "/work" },
          { name: project.title, path: `/work/${project.slug}` },
        ])}
      />
      <article>
        <ProjectCartridge
          project={project}
          locale={locale}
          title={localized.title as string}
          tagline={tagline}
        />

        <div className="mx-auto grid w-full max-w-page gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[260px_1fr] lg:gap-16 lg:px-8">
          <SpecRail
            sections={toc}
            facts={facts}
            liveUrl={project.liveUrl}
            githubUrl={project.githubUrl}
            labels={{
              onThisPage: tCase("onThisPage"),
              spec: tProjects("quickFacts"),
              live: tProjects("live"),
              source: tProjects("source"),
            }}
          />

          <div className="min-w-0 space-y-12 lg:space-y-16">
            {/* Hero cover */}
            <BlurFade>
              <figure className="relative aspect-16/10 overflow-hidden rounded-lg border bg-muted">
                {cover ? (
                  <BlurImage
                    src={cover.src}
                    alt={cover.alt}
                    fill
                    priority
                    sizes="(min-width: 1280px) 880px, 100vw"
                    unoptimized={cover.src.endsWith(".svg")}
                    className="object-cover"
                  />
                ) : (
                  <PlaceholderImage
                    label={tProjects("mediaTbd")}
                    aspect="h-full"
                    className="rounded-none border-0"
                  />
                )}
              </figure>
            </BlurFade>

            {/* Overview — product framing of problem + solution */}
            <Section id="overview" index={indexOf("overview")} title={tCase("overview")}>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className={eyebrowMono}>{tProjects("problem")}</p>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">
                    {localized.problem as string}
                  </p>
                </div>
                <div>
                  <p className={eyebrowMono}>{tProjects("solution")}</p>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">
                    {localized.solution as string}
                  </p>
                </div>
              </div>
            </Section>

            {/* Screenshots */}
            {hasGallery ? (
              <Section id="screens" index={indexOf("screens")} title={tCase("screenshots")}>
                <ScreenshotGallery
                  shots={galleryShots}
                  labels={{
                    viewLarger: tCase("viewLarger"),
                    close: tCase("closeGallery"),
                    previous: tCase("previous"),
                    next: tCase("next"),
                  }}
                />
              </Section>
            ) : null}

            {/* Built with */}
            <Section id="stack" index={indexOf("stack")} title={tCase("builtWith")}>
              <TechStackPanel groups={project.stackGroups} stack={project.stack} />
            </Section>

            {/* Highlights */}
            {hasFeatures ? (
              <Section
                id="highlights"
                index={indexOf("highlights")}
                title={tCase("highlights")}
              >
                <ul className="grid gap-3 sm:grid-cols-2">
                  {project.features.map((feature, i) => (
                    <li
                      key={`${i}-${feature}`}
                      className="flex gap-3 rounded-md border border-border bg-card/50 p-4"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-ring"
                      />
                      <span className="text-sm leading-6 text-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {/* Under the hood */}
            {hasBuild ? (
              <Section id="build" index={indexOf("build")} title={tCase("underTheHood")}>
                <div className="grid gap-10 sm:grid-cols-2">
                  {project.architectureNotes.length > 0 ? (
                    <div>
                      <p className={eyebrowMono}>{tProjects("architecture")}</p>
                      <div className="mt-3">
                        <CaseStudyList items={project.architectureNotes} />
                      </div>
                    </div>
                  ) : null}
                  {project.challenges.length > 0 ? (
                    <div>
                      <p className={eyebrowMono}>{tCase("challenges")}</p>
                      <div className="mt-3">
                        <CaseStudyList items={project.challenges} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}

            {/* Outcome */}
            {project.outcome ? (
              <Section id="outcome" index={indexOf("outcome")} title={tCase("outcomeEyebrow")}>
                <PullQuoteBlock quote={localized.outcome as string} />
              </Section>
            ) : null}

            {/* Roadmap & lessons */}
            {hasRoadmap ? (
              <Section id="roadmap" index={indexOf("roadmap")} title={tCase("roadmap")}>
                <div className="grid gap-10 sm:grid-cols-2">
                  {project.lessonsLearned.length > 0 ? (
                    <div>
                      <p className={eyebrowMono}>{tProjects("lessons")}</p>
                      <div className="mt-3">
                        <CaseStudyList items={project.lessonsLearned} numbered />
                      </div>
                    </div>
                  ) : null}
                  {project.nextSteps.length > 0 ? (
                    <div>
                      <p className={eyebrowMono}>{tProjects("next")}</p>
                      <div className="mt-3">
                        <CaseStudyList items={project.nextSteps} numbered />
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="border-t bg-muted/20">
            <div className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 lg:px-8">
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
