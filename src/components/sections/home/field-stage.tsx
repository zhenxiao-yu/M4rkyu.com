import { VisualPreview } from "./visual-preview";
import { WritingPulseSection } from "./writing-pulse-section";
import { ResourcesPreview } from "./resources-preview";
import { SectionBackground } from "./section-background";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import type { Locale } from "@/i18n/routing";

/**
 * "Field" act — Visual archive + Writing pulse + Resources, combined into one
 * scroll stage. The three members render in `embedded` mode under one shared
 * `aperture` backdrop and `max-w-page` column; each lands with the cinematic
 * deep-blur → scale-up entrance, staggered a beat apart.
 *
 * Sized to content (not forced `min-h-dvh`) since three members run taller
 * than a viewport. Part of the home-spine condense — see
 * docs/REDESIGN_DIRECTION.md / UNIFIED_VISUAL_DIRECTION.md.
 */
export async function FieldStage({ locale }: { locale: Locale }) {
  return (
    <section
      data-home-section="section"
      data-section="field"
      className="relative isolate flex flex-col py-20 sm:py-28 lg:py-32"
    >
      <SectionBackground variant="aperture" />
      <div className="relative mx-auto flex w-full max-w-page flex-col gap-16 px-4 sm:gap-20 sm:px-6 lg:gap-24 lg:px-8">
        <CinematicReveal>
          <VisualPreview locale={locale} embedded />
        </CinematicReveal>
        <CinematicReveal delay={0.06}>
          <WritingPulseSection locale={locale} embedded />
        </CinematicReveal>
        <CinematicReveal delay={0.12}>
          <ResourcesPreview locale={locale} embedded />
        </CinematicReveal>
      </div>
    </section>
  );
}
