import { getTranslations } from "next-intl/server";
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
  /** Localized tagline / short pitch — single line below the title. */
  tagline: string;
}

/**
 * Detail-page hero band for /work/[slug]. Holds the back link, the
 * category/year/status cartridge label, the title, and the tagline. The spec
 * sheet (role, stack, links) now lives in the sticky <SpecRail> beside the
 * content, so the hero stays a clean product banner. Featured projects get one
 * BorderBeam per docs/UI_LIBRARY_STRATEGY.md §5.
 */
export async function ProjectCartridge({
  project,
  locale,
  title,
  tagline,
}: ProjectCartridgeProps) {
  const t = await getTranslations({ locale, namespace: "CaseStudy" });
  const tCategories = await getTranslations({
    locale,
    namespace: "Categories",
  });
  const tStatus = await getTranslations({ locale, namespace: "Status" });

  return (
    <header className="relative overflow-hidden border-b">
      {/* atmospheric layers — cyber grid + vignette */}
      <div
        className="absolute inset-0 bg-cyber-grid opacity-30"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Link
          href="/work"
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
                <SystemBadge
                  status={project.contentStatus}
                  label={tStatus(project.contentStatus)}
                />
              </div>
            </PixelPanel>
          </aside>

          <h1 className="max-w-5xl text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
            {title}
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {tagline}
          </p>
        </BlurFade>
      </div>
    </header>
  );
}
