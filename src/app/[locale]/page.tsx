import { HeroSection } from "@/components/sections/hero-section";
import { CapabilitiesSection } from "@/components/sections/capabilities-section";
import { IntroLoaderIsland } from "@/components/system/intro-loader-island";
import { HomeSmoothScroll } from "@/providers/home-smooth-scroll";
import { AnimatedSeparator } from "@/components/sections/home/animated-separator";
import { AboutBriefly } from "@/components/sections/home/about-briefly";
import { SelectedWork } from "@/components/sections/home/selected-work";
import { FramesGallery } from "@/components/sections/home/frames-gallery";
import { LetsBuildCta } from "@/components/sections/home/lets-build-cta";
import { WritingPulseSection } from "@/components/sections/home/writing-pulse-section";
import { PageShell } from "@/components/layout/page-shell";
import { allProjects } from "@/content/projects";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates(locale, ""),
  };
}

/**
 * Home page spine. Every section between the hero and the closing CTA
 * composes through the shared `HomeSection` shell so vertical rhythm,
 * eyebrow style, heading scale, lede width, action link, and tone
 * (default vs muted) are normalised.
 *
 *   1. IntroLoaderIsland      — first-paint branded boot, once per session.
 *   2. HeroSection            — name-led, full-bleed wave backdrop.
 *   3. AnimatedSeparator      — single marquee strip; visual breath.
 *   4. AboutBriefly           — "Mark, briefly" + portrait + values.
 *   5. CapabilitiesSection    — five numbered systems.
 *   6. SelectedWork           — bento grid of ready + draft projects.
 *   7. FramesGallery          — chronological journey timeline.
 *   8. WritingPulseSection    — latest + devlog posts.
 *   9. LetsBuildCta           — closing CTA.
 *
 * Two separators were retired in the polish pass — the
 * default→muted alternation between sections now carries the rhythm
 * without needing a chrome strip between every pair.
 *
 * `HomeSmoothScroll` instantiates Lenis + lazy-registers ScrollTrigger
 * — home-only by design (other routes use motion/react's `useScroll`).
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PageShell locale={locale}>
      <HomeSmoothScroll>
        <IntroLoaderIsland />
        <HeroSection locale={locale} />
        <AnimatedSeparator mode="marquee" />
        <AboutBriefly locale={locale} />
        <CapabilitiesSection locale={locale} />
        <SelectedWork locale={locale} projects={allProjects} />
        <FramesGallery locale={locale} />
        <WritingPulseSection locale={locale} />
        <LetsBuildCta locale={locale} />
      </HomeSmoothScroll>
    </PageShell>
  );
}
