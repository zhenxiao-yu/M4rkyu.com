"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { GhostedWord } from "@/components/ui/magic/ghosted-word";
import { TiltedCard } from "@/components/ui/magic/tilted-card";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { HomeSection } from "./home-section";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/content/localize";
import type { Project } from "@/content/schemas";
import { cn } from "@/lib/utils";

interface SelectedWorkProps {
  locale: Locale;
  projects: Project[];
}

/**
 * Selected-work showcase. Bento grid of ready projects up top, dimmed
 * draft tiles below. The shared `HomeSection` shell handles the header
 * eyebrow/heading/lede + the right-aligned "All projects" link. The
 * ghosted "WORK" backdrop is appended into the same section via the
 * shell's `className` prop so it stays scoped to this section's
 * stacking context.
 *
 * Scales with content:
 *   - 0 ready projects: header + draft grid renders only.
 *   - 1 ready project: shows as the hero tile, full row.
 *   - 2-3 ready projects: hero + standard tiles fill the bento.
 *   - >3 ready: the extras spill into a regular grid below the bento
 *     (3 columns on lg+, single col on mobile).
 *   - Drafts cap at 5 visible to keep the section a snapshot — see
 *     /work for the full list.
 */
export function SelectedWork({ locale, projects }: SelectedWorkProps) {
  const t = useTranslations("Home.selectedWork");

  const { hero, secondary, extra, drafts } = useMemo(() => {
    const r = projects.filter((p) => p.contentStatus === "ready");
    const d = projects.filter((p) => p.contentStatus !== "ready").slice(0, 5);
    return {
      hero: r[0],
      secondary: r.slice(1, 3),
      extra: r.slice(3),
      drafts: d,
    };
  }, [projects]);

  return (
    <HomeSection
      tone="muted"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <Link
          href="/work"
          locale={locale}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("openWork")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
      dataSection="selected-work"
      className="overflow-hidden"
    >
      {/* Backdrop stack — interactive dot grid + ghosted WORK word. */}
      <DotGrid
        className="-z-10"
        spacing={32}
        baseDotSize={1}
        hoverDotSize={3.5}
        influenceRadius={160}
        baseOpacity={0.18}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden -translate-y-1/2 justify-center mix-blend-difference md:flex"
      >
        <span className="font-display text-[22vw] font-black leading-[0.85] tracking-tight text-foreground/12 dark:text-foreground/15">
          <GhostedWord text={t("titleWord")} ghosts={4} spread={32} />
        </span>
      </div>

      {/* Hero + secondary bento. Layouts:
        *   - lg+ : 12-col grid, hero spans 7×2, secondaries stack 5×1 each
        *   - md  : 12-col grid same as lg+
        *   - <md : single column, hero first then secondaries below */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:auto-rows-fr">
        {hero ? (
          <ProjectTile
            project={hero}
            locale={locale}
            size="hero"
            priority
            className="md:col-span-7 md:row-span-2"
          />
        ) : null}
        {secondary.map((project) => (
          <ProjectTile
            key={project.slug}
            project={project}
            locale={locale}
            size="standard"
            priority
            className="md:col-span-5"
          />
        ))}
      </div>

      {/* Extra ready projects (beyond top 3) shown in a regular grid. */}
      {extra.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {extra.map((project) => (
            <ProjectTile
              key={project.slug}
              project={project}
              locale={locale}
              size="standard"
            />
          ))}
        </div>
      ) : null}

      {/* Drafts strip. Smaller, dimmed. */}
      {drafts.length > 0 ? (
        <div className="mt-12">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("draftsLabel")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {drafts.map((project) => (
              <ProjectTile
                key={project.slug}
                project={project}
                locale={locale}
                size="draft"
              />
            ))}
          </div>
        </div>
      ) : null}
    </HomeSection>
  );
}

type TileSize = "hero" | "standard" | "draft";

function ProjectTile({
  project,
  locale,
  size,
  priority = false,
  className,
}: {
  project: Project;
  locale: Locale;
  size: TileSize;
  /** Pass `priority` for tiles above the fold; Next preloads them. */
  priority?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const localized = localize(project, locale);
  const cover = project.screenshots[0];
  const isReady = project.contentStatus === "ready";

  const isHero = size === "hero";
  const isDraft = size === "draft";
  const aspect = isHero ? "aspect-16/11" : isDraft ? "aspect-square" : "aspect-4/3";

  const inner = (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        // TiltedCard handles the lift + glare on hover, so the inner
        // article only animates border-color + shadow here (no
        // duplicate translate / scale fight).
        "group relative isolate flex h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-[box-shadow,border-color,filter,opacity] duration-(--motion-base) ease-(--ease-premium)",
        isReady && "hover:border-ring/60 hover:shadow-xl hover:shadow-black/20",
        // Drafts read as inactive at rest (desaturated + dimmed) but
        // restore to full color/opacity on hover so the user can
        // sample what's coming without losing the visual hierarchy.
        isDraft && "opacity-60 grayscale hover:opacity-100 hover:grayscale-0",
      )}
    >
      <div className={cn("relative w-full overflow-hidden bg-muted", aspect)}>
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority={priority}
            sizes={isHero ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 50vw, 30vw"}
            className={cn(
              "object-cover transition-transform duration-300 ease-(--ease-premium)",
              isReady && "group-hover:scale-105",
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              cover · tbd
            </span>
          </div>
        )}
        {/* Bottom gradient legibility plate. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-background/95 via-background/40 to-transparent"
        />
        {!isReady ? (
          <Badge
            variant="warning"
            className="absolute right-3 top-3 font-mono text-[0.55rem] tracking-[0.22em]"
          >
            draft
          </Badge>
        ) : null}
      </div>

      <div className={cn("absolute inset-x-0 bottom-0 p-4", isHero && "p-6")}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[0.55rem] tracking-[0.22em]">
            {project.year}
          </Badge>
          <Badge variant="outline" className="font-mono text-[0.55rem] tracking-[0.22em]">
            {project.category}
          </Badge>
          {isReady ? (
            <ArrowUpRight
              aria-hidden="true"
              className="ml-auto size-4 text-foreground/60 transition-all duration-(--motion-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
            />
          ) : null}
        </div>
        <h3
          className={cn(
            "mt-3 font-heading font-semibold leading-tight",
            isHero ? "text-2xl sm:text-3xl" : isDraft ? "text-sm" : "text-lg",
          )}
        >
          {localized.title}
        </h3>
        {!isDraft ? (
          <p
            className={cn(
              "mt-2 line-clamp-2 text-muted-foreground",
              isHero ? "text-sm leading-6" : "text-xs leading-5",
            )}
          >
            {localized.shortPitch as string}
          </p>
        ) : null}
      </div>
    </motion.article>
  );

  if (!isReady) {
    return (
      <div className={cn("block", className)}>
        {isDraft ? inner : <TiltedCard maxTilt={6} glare={0.3}>{inner}</TiltedCard>}
      </div>
    );
  }
  return (
    <Link
      href={`/work/${project.slug}`}
      locale={locale}
      data-cursor="link"
      className={cn(
        "block focus-visible:outline-none focus-visible:[&_article]:ring-2 focus-visible:[&_article]:ring-ring",
        className,
      )}
    >
      <TiltedCard maxTilt={isHero ? 10 : 7} glare={0.5}>
        {inner}
      </TiltedCard>
    </Link>
  );
}
