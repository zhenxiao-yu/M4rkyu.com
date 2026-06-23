import { HeroSection } from "@/components/sections/hero-section";
import { IntroLoaderIsland } from "@/components/system/intro-loader-island";
import { HomeSmoothScroll } from "@/providers/home-smooth-scroll";
import { AskSection } from "@/components/sections/home/ask-section";
import { CompassSection } from "@/components/sections/home/compass-section";
import { SelectedWork } from "@/components/sections/home/selected-work";
import { GamesPreview } from "@/components/sections/home/games-preview";
import { VisualPreview } from "@/components/sections/home/visual-preview";
import { WritingPulseSection } from "@/components/sections/home/writing-pulse-section";
import { ResourcesPreview } from "@/components/sections/home/resources-preview";
import { AboutPreview } from "@/components/sections/home/about-preview";
import { LetsBuildCta } from "@/components/sections/home/lets-build-cta";
import { PageShell } from "@/components/layout/page-shell";
import { buildAlternates } from "@/lib/seo/alternates";
import { getProjectsSource } from "@/lib/projects/source";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    // `absolute` skips the "%s | ZhenXiao Mark Yu" template — the home
    // title already carries the full name, so the template would double it.
    title: { absolute: t("homeTitle") },
    description: t("homeDescription"),
    alternates: buildAlternates(locale, ""),
  };
}

// Home spine — a storybook of continuous scroll stages, each an
// entry-point dashboard into one area of the site:
//   Hero (identity) → Compass (orientation map) → Work → Games →
//   Visual (archive + media) → Writing → Resources → About → CTA.
// HomeSmoothScroll owns Lenis + GSAP ScrollTrigger for smooth, scrubbed
// movement; sections are explicit scroll targets, not snap points.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const allProjects = await getProjectsSource();

  return (
    <>
      {/* Pre-paint boot cover — an opaque, SSR'd overlay so a fresh home load
       * never flashes the page before the (ssr:false) boot mounts. The boot
       * island hides it (html[data-booted]) the instant its overlay paints;
       * CSS hides it for reduced motion, and the <noscript> rule + a failsafe
       * fade (globals.css) cover the no-JS / chunk-error cases. */}
      <div id="boot-cover" aria-hidden="true" />
      <noscript>
        <style>{`#boot-cover{display:none}`}</style>
      </noscript>
      <PageShell locale={locale}>
        <HomeSmoothScroll>
          <IntroLoaderIsland />
          <HeroSection locale={locale} />
          <AskSection />
          <CompassSection locale={locale} />
          <SelectedWork locale={locale} projects={allProjects} />
          <GamesPreview locale={locale} />
          <VisualPreview locale={locale} />
          <WritingPulseSection locale={locale} />
          <ResourcesPreview locale={locale} />
          <AboutPreview locale={locale} />
          <LetsBuildCta locale={locale} />
        </HomeSmoothScroll>
      </PageShell>
    </>
  );
}
