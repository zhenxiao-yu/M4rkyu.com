import { HeroSection } from "@/components/sections/hero-section";
import { IntroLoaderIsland } from "@/components/system/intro-loader-island";
import { HomeSmoothScroll } from "@/providers/home-smooth-scroll";
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
import { setRequestLocale } from "next-intl/server";
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
  return {
    alternates: buildAlternates(locale, ""),
  };
}

// Home spine — a storybook of full-page snap slides, each an
// entry-point dashboard into one area of the site:
//   Hero (identity) → Compass (orientation map) → Work → Games →
//   Visual (archive + media) → Writing → Resources → About → CTA.
// Snap is owned by HomeSmoothScroll (Lenis Snap on desktop, native CSS
// scroll-snap on touch); every HomeSection defaults to a snap point.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const allProjects = await getProjectsSource();

  return (
    <PageShell locale={locale}>
      <HomeSmoothScroll>
        <IntroLoaderIsland />
        <HeroSection locale={locale} />
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
  );
}
