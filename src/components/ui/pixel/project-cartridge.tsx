import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PixelPanel } from "./pixel-panel";
import { SystemBadge } from "./system-badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/content/schemas";

interface ProjectCartridgeProps {
  project: Project;
  locale: Locale;
  /** Localized project title — comes from `localize(project, locale).title`. */
  title: string;
  /** Localized short pitch — single line below the title. */
  shortPitch: string;
  /** Localized role description for the metadata `<dl>`. */
  role: string;
}

/**
 * Detail-page header card. Replaces CaseStudyHeader on /projects/[slug].
 * Featured projects get a single BorderBeam treatment around the
 * cartridge label per docs/UI_LIBRARY_STRATEGY.md §5 (one beam per page).
 */
export async function ProjectCartridge({
  project,
  locale,
  title,
  shortPitch,
  role,
}: ProjectCartridgeProps) {
  const t = await getTranslations({ locale, namespace: "CaseStudy" });
  const tProjects = await getTranslations({ locale, namespace: "Projects" });
  const tCategories = await getTranslations({
    locale,
    namespace: "Categories",
  });

  return (
    <header className="relative overflow-hidden border-b">
      {/* atmospheric layers — keep parity with the prior CaseStudyHeader */}
      <div
        className="absolute inset-0 bg-cyber-grid opacity-30"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Link
          href="/projects"
          locale={locale}
          className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground"
        >
          ← {t("projectsIndex")}
        </Link>

        <BlurFade className="mt-10 flex flex-col gap-7">
          {/* Cartridge label — inset PixelPanel hosting category / year /
            * status. Featured projects gain a BorderBeam around it. */}
          <aside className="relative max-w-md">
            {project.featured ? (
              <BorderBeam duration={14} borderRadius={6} />
            ) : null}
            <PixelPanel>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {tCategories(project.category)} · {project.year}
                </span>
                {/* SystemBadge already shows the contentStatus with a
                  * friendly localized-ish label (Ready / Draft / Pending /
                  * Soon); a second DraftBadge would duplicate the chip
                  * and leak the raw enum value into the UI. */}
                <SystemBadge status={project.contentStatus} />
              </div>
            </PixelPanel>
          </aside>

          <h1 className="max-w-5xl text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
            {title}
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {shortPitch}
          </p>

          {/* Metadata dl — role / stack / links. On mobile, actions scroll
            * horizontally per §4.11. The `dl` rows are auto-stacking. */}
          <dl className="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-[auto_1fr] sm:gap-x-10">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {tProjects("role")}
            </dt>
            <dd className="text-sm leading-7 text-foreground">{role}</dd>

            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {tProjects("stack")}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="text-[0.65rem]"
                >
                  {item}
                </Badge>
              ))}
            </dd>

            {project.liveUrl || project.githubUrl ? (
              <>
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("links")}
                </dt>
                <dd className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible">
                  {project.liveUrl ? (
                    <Button asChild size="sm">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tProjects("live")}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </a>
                    </Button>
                  ) : null}
                  {project.githubUrl ? (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tProjects("source")}
                      </a>
                    </Button>
                  ) : null}
                </dd>
              </>
            ) : null}
          </dl>
        </BlurFade>
      </div>
    </header>
  );
}
