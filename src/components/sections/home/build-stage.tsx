import { SelectedWork } from "./selected-work";
import { GamesPreview } from "./games-preview";
import { SectionBackground } from "./section-background";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/content/schemas";

/**
 * "Build" act — Selected Work + Games combined into one denser scroll stage.
 *
 * Both members render in `embedded` mode (inner content only, quieter h3
 * headers, no own backdrop), so this act owns the single `<section>` stage,
 * one shared `blueprint` backdrop, and the `max-w-page` column. Each member
 * lands with the cinematic deep-blur → scale-up entrance, the second a beat
 * after the first.
 *
 * Part of the home-spine condense (Hero · Ask · Build · Field · Connect);
 * see docs/REDESIGN_DIRECTION.md / UNIFIED_VISUAL_DIRECTION.md.
 */
export async function BuildStage({
  locale,
  projects,
}: {
  locale: Locale;
  projects: Project[];
}) {
  return (
    <section
      data-home-section="stage"
      data-section="build"
      className="relative isolate flex min-h-dvh flex-col justify-center py-16 sm:py-24 lg:py-28"
    >
      <SectionBackground variant="blueprint" />
      <div className="relative mx-auto flex w-full max-w-page flex-col gap-16 px-4 sm:gap-20 sm:px-6 lg:gap-24 lg:px-8">
        <CinematicReveal>
          <SelectedWork locale={locale} projects={projects} embedded />
        </CinematicReveal>
        <CinematicReveal delay={0.08}>
          <GamesPreview locale={locale} embedded />
        </CinematicReveal>
      </div>
    </section>
  );
}
