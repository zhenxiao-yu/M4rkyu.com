import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BioCard } from "@/components/about/bio-card";
import { GithubStatsCard } from "@/components/about/github-stats-card";
import { NowPlayingCard } from "@/components/about/now-playing-card";
import { SkillsRail } from "@/components/about/skills-rail";
import { TravelMapCard } from "@/components/about/travel-map-card";
import { ObsessionsCard } from "@/components/about/obsessions-card";
import { TimelineCard } from "@/components/about/timeline-card";
import { profile } from "@/content/profile";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates(locale, "/about"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <PageShell locale={locale}>
      <PageSection>
        {/* Hero strip — name + location only, agent-voice silence on titles. */}
        <Card className="relative overflow-hidden border-border/70 bg-card/80">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cyber-grid opacity-25"
          />
          <CardContent className="relative grid gap-4 px-5 py-7 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:px-7">
            <div className="grid gap-2">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                {t("metaCard.eyebrow")}
              </p>
              <h1 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-none tracking-tight">
                {profile.name.toUpperCase()}
              </h1>
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <MapPin className="size-3" aria-hidden="true" />
                {profile.location}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" className="font-mono text-[0.6rem]">
                <span className="mr-1 inline-block size-1.5 rounded-full bg-current align-middle" />
                {t("metaCard.available")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
          {t("intro")}
        </p>

        {/* Bento grid. Mobile = single col; md = 2 cols (Bio/GitHub,
         * Skills/NowPlaying, Travel/Obsessions, Timeline/CTA); lg = 4 cols
         * with span hints so the wider cards reclaim their breathing room. */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <BioCard locale={locale} className="md:col-span-2 lg:col-span-2" />
          <GithubStatsCard className="md:col-span-2 lg:col-span-2" />

          <SkillsRail locale={locale} className="md:col-span-2 lg:col-span-3" />
          <NowPlayingCard className="lg:col-span-1" />

          <TravelMapCard locale={locale} className="md:col-span-2 lg:col-span-3" />
          <ObsessionsCard locale={locale} className="lg:col-span-1" />

          <TimelineCard locale={locale} className="lg:col-span-2" />

          <Card className="bg-card/80 md:col-span-2 lg:col-span-2">
            <CardContent className="grid h-full content-between gap-4 p-5">
              <div className="grid gap-2">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
                  /contact
                </p>
                <h2 className="text-lg font-semibold">{t("cta.title")}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("cta.body")}
                </p>
              </div>
              <Button asChild className="w-fit">
                <Link href="/contact" locale={locale}>
                  {t("cta.button")}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </PageShell>
  );
}
