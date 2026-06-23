import { AboutBanner } from "./about-banner";
import { LetsBuildCta } from "./lets-build-cta";
import { SectionBackground } from "./section-background";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import type { Locale } from "@/i18n/routing";

/**
 * "Connect" act — a slim About banner + a slim closing CTA strip over one
 * shared `contour` backdrop. The CTA dropped its own Waves/stars (which clashed
 * with the contour) for a calm strip, and About is a one-line banner into the
 * full /about page. Both arrive with the cinematic deep-blur → scale-up
 * entrance, the CTA a beat after the banner.
 *
 * Part of the home-spine condense — see docs/REDESIGN_DIRECTION.md /
 * UNIFIED_VISUAL_DIRECTION.md.
 */
export async function ConnectStage({ locale }: { locale: Locale }) {
  return (
    <section
      data-home-section="section"
      data-section="connect"
      className="relative isolate flex flex-col py-20 sm:py-28 lg:py-32"
    >
      <SectionBackground variant="contour" />
      <div className="relative mx-auto flex w-full max-w-page flex-col gap-16 px-4 sm:gap-20 sm:px-6 lg:gap-24 lg:px-8">
        <CinematicReveal>
          <AboutBanner locale={locale} />
        </CinematicReveal>
        <CinematicReveal delay={0.08}>
          <LetsBuildCta locale={locale} embedded />
        </CinematicReveal>
      </div>
    </section>
  );
}
