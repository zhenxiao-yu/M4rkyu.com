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
import { buildAlternates } from "@/lib/seo/alternates";
import { getProjectsSource } from "@/lib/projects/source";
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

// Home spine — sections compose through HomeSection for shared rhythm; HomeSmoothScroll lazy-registers Lenis + ScrollTrigger (home-only).
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const allProjects = await getProjectsSource();

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
