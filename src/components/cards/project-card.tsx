"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { ArrowUpRight, Code } from "lucide-react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/magic/border-beam"
import { DraftBadge } from "@/components/placeholders/draft-badge"
import { PlaceholderImage } from "@/components/placeholders/placeholder-image"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { localize } from "@/lib/content/localize"
import type { Project } from "@/content/schemas"

const ease = [0.2, 0.7, 0.2, 1] as const

interface ProjectCardProps {
  project: Project
  locale: Locale
  /**
   * Wraps the card with a BorderBeam highlight. Use sparingly —
   * `docs/UI_LIBRARY_STRATEGY.md` §9 forbids more than one beam in
   * view at once. Currently used on the FIRST featured card on the
   * homepage only.
   */
  highlighted?: boolean
}

export function ProjectCard({ project, locale, highlighted = false }: ProjectCardProps) {
  const t = useTranslations("Projects")
  const localized = localize(project, locale)
  const cover = project.screenshots[0]
  const isDraft = project.contentStatus !== "ready"
  const stackDisplay = project.stack.length > 6
    ? [...project.stack.slice(0, 5), `+${project.stack.length - 5}`]
    : project.stack

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease }}
      className="relative h-full"
    >
      {highlighted ? <BorderBeam duration={14} borderRadius={8} /> : null}
      <Card className="group relative h-full overflow-hidden bg-card/80 transition duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:shadow-lg hover:shadow-ring/5">
        <div className="relative aspect-16/10 overflow-hidden border-b bg-muted">
          {cover ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
          ) : (
            <PlaceholderImage label={t("mediaTbd")} aspect="h-full" className="rounded-none border-0" />
          )}
        </div>

        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={project.featured ? "success" : "outline"}>{project.status}</Badge>
              {isDraft ? <DraftBadge label={project.contentStatus} /> : null}
            </div>
            <span className="font-mono text-xs text-muted-foreground">{project.year}</span>
          </div>
          <CardTitle className="mt-1 text-base leading-snug">{localized.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="min-h-[4rem] text-sm leading-6 text-muted-foreground">
            {localized.shortPitch as string}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stackDisplay.map((item) => (
              <Badge key={item} variant="outline" className="text-[0.65rem]">
                {item}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/projects/${project.slug}`} locale={locale}>
                {t("caseStudy")}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            {project.githubUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Code className="size-3.5" />
                  {t("source")}
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
