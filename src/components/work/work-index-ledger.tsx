"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/content/localize";
import type { Project } from "@/content/schemas";
import { cn } from "@/lib/utils";

// Status → readout dot tone. Mirrors the mission-dossier card's
// vocabulary so the GRID and INDEX views speak the same HUD language:
// shipped reads "live" (success), active builds warn amber, maintenance
// rides the cyan ring, the rest go quiet.
const STATUS_DOT: Record<Project["status"], string> = {
  ready: "bg-success",
  development: "bg-warning",
  maintenance: "bg-ring",
  archived: "bg-muted-foreground",
  draft: "bg-muted-foreground",
};

const MAX_STACK = 4;

const listVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};

const rowVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    // Inline easing: motion/react can't read CSS vars in transition.ease.
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

interface WorkIndexLedgerProps {
  projects: Project[];
  locale: Locale;
}

/**
 * "Accession register" view of the project archive. Where the GRID view
 * leans on cover plates, INDEX leans on the data the content already
 * carries — number, status, type, year, stack — laid out as a dense,
 * scannable manifest. Each row is the case-study link (stretched-link
 * pattern: the title anchor paints an `::after` over the whole row).
 *
 * Cyber/HUD/blueprint half of the surface language: monospace catalog
 * numbers, a status readout dot, an accent rail + `>` glyph on
 * hover/focus, single `--ring` accent. Honors reduced motion (rows
 * render in their final state, no stagger).
 */
export function WorkIndexLedger({ projects, locale }: WorkIndexLedgerProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Categories");
  const tStatus = useTranslations("ProjectStatus");
  const reduced = useReducedMotion();

  return (
    <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card">
      {/* Top hairline accent — a quiet brand tick across the manifest. */}
      <span
        aria-hidden="true"
        className="block h-px w-full bg-linear-to-r from-transparent via-ring/40 to-transparent"
      />

      {/* Column header — the register's legend. Hidden on mobile, where
          rows collapse to a stacked compact layout. */}
      <div
        aria-hidden="true"
        className="hidden grid-cols-[3rem_minmax(0,2.4fr)_7rem_3.5rem_minmax(0,1.6fr)_2.25rem] items-center gap-x-4 border-b border-border/70 px-5 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground/70 md:grid"
      >
        <span className="text-right tabular-nums">№</span>
        <span>{t("ledger.colProject")}</span>
        <span>{t("ledger.colType")}</span>
        <span>{t("ledger.colYear")}</span>
        <span>{t("ledger.colStack")}</span>
        <span className="sr-only">{t("ledger.colOpen")}</span>
      </div>

      <motion.ul
        variants={reduced ? undefined : listVariant}
        initial={reduced ? undefined : "hidden"}
        animate={reduced ? undefined : "visible"}
        className="divide-y divide-border/55"
      >
        {projects.map((project, index) => {
          const localized = localize(project, locale);
          const stack = project.stack.slice(0, MAX_STACK);
          const overflow = project.stack.length - stack.length;

          return (
            <motion.li
              key={project.slug}
              variants={reduced ? undefined : rowVariant}
              className={cn(
                "group/row relative grid grid-cols-[2.25rem_minmax(0,1fr)_1.25rem] items-center gap-x-3 gap-y-1.5 px-4 py-3.5 transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                "md:grid-cols-[3rem_minmax(0,2.4fr)_7rem_3.5rem_minmax(0,1.6fr)_2.25rem] md:gap-x-4 md:px-5",
                "hover:bg-ring/[0.045]",
                "has-[[data-card-link]:focus-visible]:bg-ring/[0.06]",
              )}
            >
              {/* Selected-row accent rail — fades in on hover/focus. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-ring opacity-0 transition-opacity duration-(--motion-fast) ease-(--ease-premium) group-hover/row:opacity-100 group-has-[[data-card-link]:focus-visible]/row:opacity-100"
              />

              {/* Catalog number. */}
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground/70 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover/row:text-ring">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Project cell — status dot + title (stretched link) + pitch. */}
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  {/* HUD status readout dot. The status is color-coded, so
                      a visually-hidden label carries it to assistive tech
                      (never rely on color alone). */}
                  <span className="relative flex size-1.5 shrink-0 items-center justify-center">
                    {project.status === "ready" && project.featured ? (
                      <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
                    ) : null}
                    <span
                      className={cn(
                        "relative inline-flex size-1.5 rounded-full",
                        STATUS_DOT[project.status],
                      )}
                    />
                    <span className="sr-only">{tStatus(project.status)}</span>
                  </span>

                  {/* Hover-reveal `>` glyph — game-feel cue, not a glow. */}
                  <span
                    aria-hidden="true"
                    className="hidden w-0 shrink-0 overflow-hidden font-mono text-xs text-ring opacity-0 transition-[width,opacity] duration-(--motion-fast) ease-(--ease-premium) group-hover/row:w-2.5 group-hover/row:opacity-100 sm:inline"
                  >
                    &gt;
                  </span>

                  <h3 className="min-w-0 truncate text-sm font-semibold leading-snug text-foreground">
                    <Link
                      data-card-link
                      href={`/work/${project.slug}`}
                      locale={locale}
                      className="decoration-ring/60 underline-offset-4 after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none group-hover/row:underline"
                    >
                      {localized.title as string}
                    </Link>
                  </h3>

                  {project.featured ? (
                    <Star
                      aria-label={t("featuredOn")}
                      className="size-3 shrink-0 fill-ring/80 text-ring/80"
                    />
                  ) : null}
                </div>

                {/* One-line pitch — editorial texture, desktop only. */}
                <p className="hidden truncate text-xs leading-5 text-muted-foreground md:block">
                  {localized.shortPitch as string}
                </p>

                {/* Mobile meta line — type · year, since those columns
                    collapse away below md. */}
                <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground md:hidden">
                  <span>{tCategories(project.category)}</span>
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                  <span>{project.year}</span>
                </div>
              </div>

              {/* Type — desktop column. */}
              <span className="hidden truncate font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground md:block">
                {tCategories(project.category)}
              </span>

              {/* Year — desktop column. */}
              <span className="hidden font-mono text-xs tabular-nums text-muted-foreground md:block">
                {project.year}
              </span>

              {/* Stack spec — desktop column. */}
              <div className="hidden min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[0.62rem] text-muted-foreground/85 md:flex">
                {stack.map((item, itemIndex) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    {itemIndex > 0 ? (
                      <span aria-hidden="true" className="text-border">
                        /
                      </span>
                    ) : null}
                    {item}
                  </span>
                ))}
                {overflow > 0 ? (
                  <span className="text-muted-foreground/55">+{overflow}</span>
                ) : null}
              </div>

              {/* Open arrow — nudges on hover/focus. */}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 justify-self-end text-muted-foreground transition-[transform,color] duration-(--motion-fast) ease-(--ease-premium) group-hover/row:text-ring motion-safe:group-hover/row:translate-x-0.5 motion-safe:group-hover/row:-translate-y-0.5"
              />
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
