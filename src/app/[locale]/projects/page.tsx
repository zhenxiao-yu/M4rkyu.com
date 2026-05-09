import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageShell } from "@/components/layout/page-shell"
import { SectionHeading } from "@/components/sections/section-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn } from "@/components/motion/fade-in"
import { allProjects } from "@/content/projects"
import type { Locale } from "@/i18n/routing"
import { buildAlternates } from "@/lib/seo/alternates"
import { ProjectsClient } from "./_client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Projects" })
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates(locale, "/projects"),
  }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Projects" })
  const readyCount = allProjects.filter((p) => p.contentStatus === "ready").length
  const draftCount = allProjects.length - readyCount

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow="work index"
              title={t("title")}
              description={t("intro")}
            />
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <Card className="bg-background/70 backdrop-blur">
              <CardHeader>
                <CardTitle>Archive status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-mono text-foreground">{readyCount}</span> production entries
                </p>
                <p>
                  <span className="font-mono text-foreground">{draftCount}</span> in development or planned
                </p>
                <p>No fabricated clients, awards, or metrics included.</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ProjectsClient projects={allProjects} locale={locale} />
      </section>
    </PageShell>
  )
}
