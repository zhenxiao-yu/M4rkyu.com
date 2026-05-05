import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageShell } from "@/components/layout/page-shell"
import { MediaFrame } from "@/components/placeholders/media-frame"
import { PlaceholderImage } from "@/components/placeholders/placeholder-image"
import { DraftBadge } from "@/components/placeholders/draft-badge"
import { FadeIn } from "@/components/motion/fade-in"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { allProjects, getProject } from "@/content/projects"
import type { Locale } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { localize } from "@/lib/content/localize"

export function generateStaticParams() {
  return allProjects.flatMap((project) => [
    { locale: "en", slug: project.slug },
    { locale: "zh", slug: project.slug },
  ])
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: project.seo.title,
    description: project.seo.description,
    alternates: { canonical: `/${locale}/projects/${slug}` },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: "Projects" })
  const localized = localize(project, locale)
  const cover = project.screenshots[0]
  const sections = [
    [t("problem"), localized.problem as string],
    [t("solution"), localized.solution as string],
    [t("role"), localized.role as string],
    [t("outcome"), localized.outcome as string],
  ]
  const related = allProjects
    .filter((item) => item.slug !== project.slug && item.category === project.category)
    .slice(0, 2)

  return (
    <PageShell locale={locale}>
      <article>
        <FadeIn>
          <section className="relative overflow-hidden border-b">
            <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
            <div className="noise-layer absolute inset-0" aria-hidden="true" />
            <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
              <div>
                <Link
                  href="/projects"
                  locale={locale}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← projects
                </Link>
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant={project.featured ? "success" : "outline"}>{project.status}</Badge>
                  {project.contentStatus !== "ready" ? (
                    <DraftBadge label={project.contentStatus} />
                  ) : null}
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
                </div>
              </div>

              <Card className="bg-background/70 backdrop-blur">
                <CardHeader>
                  <CardTitle>{t("quickFacts")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-muted-foreground">Year</span>
                    <span className="font-mono">{project.year}</span>
                    <span className="text-muted-foreground">Category</span>
                    <span className="capitalize">{project.category.replace("-", " ")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
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
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <MediaFrame eyebrow="hero media" label={cover ? "PROJECT COVER" : "MEDIA TBD"}>
              {cover ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={cover.src}
                    alt={cover.alt}
                    fill
                    sizes="(min-width: 1024px) 80vw, 100vw"
                    className="object-cover transition duration-500"
                  />
                </div>
              ) : (
                <PlaceholderImage label="PROJECT HERO MEDIA TBD" aspect="aspect-[16/10]" />
              )}
            </MediaFrame>
          </section>
        </FadeIn>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <Stagger className="grid gap-5 lg:grid-cols-2" delay={0.05}>
            {sections.map(([title, body]) => (
              <StaggerItem key={title}>
                <Card className="h-full bg-card/80">
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-base leading-8 text-muted-foreground">{body}</CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger className="mt-5 grid gap-5 lg:grid-cols-3" delay={0.05}>
            <StaggerItem>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{t("features")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                    {project.features.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{t("architecture")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                    {project.architectureNotes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                    {project.challenges.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
          </Stagger>

          <Stagger className="mt-5 grid gap-5 lg:grid-cols-2" delay={0.05}>
            <StaggerItem>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{t("lessons")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                    {project.lessonsLearned.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="h-full bg-card/80">
                <CardHeader>
                  <CardTitle>{t("next")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                    {project.nextSteps.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
          </Stagger>

          <FadeIn delay={0.1}>
            <div className="mt-12">
              <h2 className="text-2xl font-semibold">Related work</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {related.length ? (
                  related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/projects/${item.slug}`}
                      locale={locale}
                      className="rounded-lg border bg-card/80 p-5 transition-colors hover:border-ring hover:shadow-md"
                    >
                      <Badge variant="outline">{item.category}</Badge>
                      <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.shortPitch}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground md:col-span-2">
                    More case studies from this category coming soon.
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </section>
      </article>
    </PageShell>
  )
}
