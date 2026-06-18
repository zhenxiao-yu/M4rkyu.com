"use client"

import { ArrowUpRight, Code, ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"
import { DraftBadge } from "@/components/placeholders/draft-badge"
import { BlurImage } from "@/components/ui/blur-image"
import { PlaceholderImage } from "@/components/placeholders/placeholder-image"
import { BorderBeam } from "@/components/ui/magic/border-beam"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { localize } from "@/lib/content/localize"
import { cn, FOCUS_RING_INSET } from "@/lib/utils"
import type { Project } from "@/content/schemas"

// Status → readout dot tone. Maps the project lifecycle enum onto the
// HUD-status vocabulary: shipped reads "live" (success), active builds
// warn amber, maintenance rides the cyan ring, the rest go quiet.
const STATUS_DOT: Record<Project["status"], string> = {
  ready: "bg-success",
  development: "bg-warning",
  maintenance: "bg-ring",
  archived: "bg-muted-foreground",
  draft: "bg-muted-foreground",
}

const MAX_STACK = 5

interface ProjectCardProps {
  project: Project
  locale: Locale
  /**
   * Wraps the card with a BorderBeam highlight. Use sparingly —
   * `docs/UI_LIBRARY_STRATEGY.md` §9 forbids more than one beam in
   * view at once. (The homepage hero uses `MissionModuleCard`, so this
   * path is currently unused — kept for API parity.)
   */
  highlighted?: boolean
}

/**
 * Project "mission dossier" card. The whole surface is the case-study
 * link (accessible stretched-link pattern: the title anchor paints an
 * `::after` over the card; the external Source/Live links sit on a
 * raised layer so they stay independently clickable). Leans into the
 * cyber/HUD/blueprint half of the surface language rather than glass —
 * these cards render inside `WorkDeckReveal`'s opacity animation, and
 * `backdrop-filter` flattens under an opacity-fading ancestor.
 */
export function ProjectCard({ project, locale, highlighted = false }: ProjectCardProps) {
  const t = useTranslations("Projects")
  const tCategories = useTranslations("Categories")
  const tStatus = useTranslations("ProjectStatus")
  const localized = localize(project, locale)
  const cover = project.screenshots[0]
  const isDraft = project.contentStatus !== "ready"
  const stack = project.stack.slice(0, MAX_STACK)
  const overflow = project.stack.length - stack.length
  const hasLinks = Boolean(project.githubUrl || project.liveUrl)

  return (
    <article className="group relative h-full">
      {highlighted ? <BorderBeam duration={14} borderRadius={12} /> : null}
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
          "transition-[transform,border-color,box-shadow] duration-(--motion-medium) ease-(--ease-premium)",
          "group-hover:border-ring/40 group-hover:shadow-xl group-hover:shadow-ring/[0.06] motion-safe:group-hover:-translate-y-1",
          // Whole-card focus ring, driven by the stretched title link so
          // keyboard focus outlines the entire dossier, not just the text.
          "has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-ring has-[[data-card-link]:focus-visible]:ring-offset-2 has-[[data-card-link]:focus-visible]:ring-offset-background",
        )}
      >
        {/* Selected-mission accent rail — fades in on hover/focus. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-0.5 bg-ring opacity-0 transition-opacity duration-(--motion-medium) ease-(--ease-premium) group-hover:opacity-100 group-has-[[data-card-link]:focus-visible]:opacity-100"
        />

        {/* ── Cover plate ── */}
        <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-media-well">
          {cover ? (
            <>
              <BlurImage
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                // SVG covers are vector — the raster optimizer rejects them
                // without `dangerouslyAllowSVG` and gains nothing anyway, so
                // serve them as-is. Raster covers (uploads) still optimize.
                unoptimized={cover.src.endsWith(".svg")}
                className="object-cover [@media(pointer:fine)]:grayscale transition duration-500 ease-(--ease-premium) [@media(pointer:fine)]:group-hover:grayscale-0 motion-safe:group-hover:scale-[1.04]"
              />
              {/* Blueprint registration marks — light corner ticks that
                  read on the dark cover substrate; brighten on hover. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-3 z-10 opacity-40 transition-opacity duration-(--motion-medium) ease-(--ease-premium) group-hover:opacity-80"
              >
                <span className="absolute left-0 top-0 size-3 border-l border-t border-white/70" />
                <span className="absolute right-0 top-0 size-3 border-r border-t border-white/70" />
                <span className="absolute bottom-0 left-0 size-3 border-b border-l border-white/70" />
                <span className="absolute bottom-0 right-0 size-3 border-b border-r border-white/70" />
              </span>
            </>
          ) : (
            <PlaceholderImage label={t("mediaTbd")} aspect="h-full" className="rounded-none border-0" />
          )}

          {/* Catalog stamps — category (left) + year (right). Dark pills
              read over both the cover SVG and a light placeholder. */}
          <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
            <span className="inline-flex items-center rounded-md border border-white/15 bg-black/55 px-2 py-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-white/90">
              {tCategories(project.category)}
            </span>
            <span className="inline-flex items-center rounded-md border border-white/15 bg-black/55 px-2 py-0.5 font-mono text-[0.6rem] font-medium tracking-[0.1em] text-white/90">
              {project.year}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* HUD status readout. */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="relative flex size-1.5 items-center justify-center">
                {project.status === "ready" ? (
                  <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
                ) : null}
                <span className={cn("relative inline-flex size-1.5 rounded-full", STATUS_DOT[project.status])} />
              </span>
              {tStatus(project.status)}
            </span>
            {isDraft ? <DraftBadge label={project.contentStatus} /> : null}
          </div>

          {/* Title — the stretched primary link. */}
          <h3 className="text-lg font-semibold leading-snug">
            <Link
              data-card-link
              href={`/work/${project.slug}`}
              locale={locale}
              className="inline-flex items-start gap-1 text-foreground after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none"
            >
              <span className="card-title-morph decoration-ring/60 underline-offset-4 group-hover:underline">
                {localized.title}
              </span>
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
            </Link>
          </h3>

          {/* Pitch — clamped so the grid stays even. */}
          <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
            {localized.shortPitch as string}
          </p>

          {/* Stack spec line. */}
          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] text-muted-foreground">
            {stack.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden className="text-border">/</span> : null}
                {item}
              </span>
            ))}
            {overflow > 0 ? <span className="text-muted-foreground/55">+{overflow}</span> : null}
          </div>

          {/* Footer — case-study echo + secondary external links. */}
          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <span
              aria-hidden
              className="pointer-events-none font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground"
            >
              {t("caseStudy")}
            </span>
            {hasLinks ? (
              <div className="relative z-20 -mr-1 flex items-center gap-0.5">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("live")} — ${project.title}`}
                    title={t("live")}
                    className={cn(
                      "inline-grid size-8 place-items-center rounded-md text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted hover:text-foreground",
                      FOCUS_RING_INSET,
                    )}
                  >
                    <ExternalLink aria-hidden className="size-4" />
                  </a>
                ) : null}
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("source")} — ${project.title}`}
                    title={t("source")}
                    className={cn(
                      "inline-grid size-8 place-items-center rounded-md text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted hover:text-foreground",
                      FOCUS_RING_INSET,
                    )}
                  >
                    <Code aria-hidden className="size-4" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
