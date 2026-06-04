import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { AboutHero } from "@/components/about/about-hero";
import { AboutIndexBand } from "@/components/about/about-index-band";
import { AboutSignalsCard } from "@/components/about/about-signals-card";
import { BentoFx, BentoGrid } from "@/components/about/bento-fx";
import { Magnetic } from "@/components/about/magnetic";
import { TimelineTrack } from "@/components/about/timeline-track";
import { TiltedCard } from "@/components/ui/magic/tilted-card";
import {
  PortraitStack,
  type PortraitStackItem,
} from "@/components/about/portrait-stack";
import { ToolsCollapsibleCard } from "@/components/about/tools-collapsible-card";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShinyText } from "@/components/ui/magic/shiny-text";
import type { Profile } from "@/content/schemas";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProfileSource } from "@/lib/profile/source";
import { buildAlternates } from "@/lib/seo/alternates";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

const toolOrder = [
  "Code",
  "Data",
  "Creative",
  "Workflow",
];

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
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About.refined" });
  const profile = await getProfileSource();
  const portraits = getPortraits(profile);
  const toolGroups = groupTools(profile.skills);
  const indexStats = [
    { value: profile.cities.length, label: t("statCities") },
    {
      value: new Set(profile.cities.map((city) => city.country)).size,
      label: t("statCountries"),
    },
    { value: profile.skills.length, label: t("statTools") },
  ];

  return (
    <PageShell locale={locale}>
      <PageSection className="py-10 sm:py-14 lg:py-16">
        <BentoGrid className="grid auto-rows-auto gap-3 md:grid-cols-6 lg:grid-cols-12">
          <BentoFx
            pattern="cyber-grid"
            spotlight={false}
            className="md:col-span-6 lg:col-span-8"
          >
            <AboutHero
              locale={locale}
              location={profile.location}
              title={t("heroTitle")}
              body={t("heroBody")}
              roles={t.raw("heroRoles") as string[]}
              seeWork={t("seeWork")}
              sayHello={t("sayHello")}
            />
          </BentoFx>

          <BentoFx
            pattern="dots"
            spotlight={false}
            className="md:col-span-6 lg:col-span-4"
          >
            <TiltedCard maxTilt={6} glare={0.4} className="h-full rounded-lg">
              <PortraitStack
                eyebrow={t("portraitEyebrow")}
                title={t("portraitTitle")}
                placeholder={t("portraitPlaceholder")}
                previousLabel={t("portraitPrevious")}
                nextLabel={t("portraitNext")}
                items={portraits}
              />
            </TiltedCard>
          </BentoFx>

          <BentoFx pattern="diag" className="md:col-span-6 lg:col-span-12">
            <AboutIndexBand
              eyebrow={t("indexEyebrow")}
              caption={t("indexCaption")}
              stats={indexStats}
            />
          </BentoFx>

          <BentoFx pattern="dots" className="md:col-span-6 lg:col-span-4">
            <TimelineCard locale={locale} timeline={profile.timeline} />
          </BentoFx>

          <BentoFx pattern="dots" className="md:col-span-6 lg:col-span-8">
            <ToolsCollapsibleCard groups={toolGroups} />
          </BentoFx>

          <BentoFx pattern="dots" className="md:col-span-6 lg:col-span-7">
            <AboutSignalsCard />
          </BentoFx>

          <BentoFx pattern="radial" className="md:col-span-6 lg:col-span-5">
            <ClosingCard locale={locale} />
          </BentoFx>
        </BentoGrid>
      </PageSection>
    </PageShell>
  );
}

async function TimelineCard({
  locale,
  timeline,
}: {
  locale: Locale;
  timeline: Profile["timeline"];
}) {
  const t = await getTranslations({ locale, namespace: "About.refined" });

  return (
    <Card className="flex h-full flex-col bg-card/85">
      <CardHeader>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("timelineEyebrow")}
        </p>
        <CardTitle className="text-base">{t("timelineTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <TimelineTrack
          timeline={timeline}
          nowLabel={t("timelineNow")}
          nowBody={t("timelineNowBody")}
        />
      </CardContent>
    </Card>
  );
}

async function ClosingCard({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "About.refined" });

  return (
    <Card className="relative h-full overflow-hidden bg-card/85">
      {/* Faint exit-mark watermark — quiet brand texture filling the void. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -right-4 select-none font-display text-[11rem] font-semibold leading-none text-foreground/5"
      >
        M4
      </span>

      <CardContent className="relative flex h-full min-h-56 flex-col justify-between gap-6 p-6 sm:p-7">
        <div className="grid gap-3">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("closingEyebrow")}
          </p>
          <h2 className="max-w-xl text-balance font-display text-3xl font-semibold leading-tight">
            <ShinyText duration={5}>{t("closingTitle")}</ShinyText>
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {t("closingBody")}
          </p>
        </div>

        {/* Terminal sign-off — a quiet middle beat so the exit reads as a
            composed three-part card rather than a top-heavy block with a
            gap. Decorative; the caret reuses the global workspace-caret
            keyframe (held still under reduced motion). */}
        <div aria-hidden="true" className="grid gap-2 font-mono text-xs">
          <span className="h-px w-2/3 bg-linear-to-r from-border via-border/40 to-transparent" />
          <p className="text-muted-foreground/80">
            <span className="text-ring">$</span> whoami
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground/60">
            <span>{t("closingSignoff")}</span>
            <span
              className="inline-block h-3.5 w-[0.55ch] bg-foreground/45"
              style={{ animation: "workspace-caret 1.1s infinite" }}
            />
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Magnetic>
            <Button asChild>
              <Link href="/contact" locale={locale}>
                {t("sayHello")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild variant="outline">
              <Link href="/work" locale={locale}>
                {t("seeWork")}
              </Link>
            </Button>
          </Magnetic>
        </div>
      </CardContent>
    </Card>
  );
}

function getPortraits(profile: Profile): PortraitStackItem[] {
  if (profile.portraits.length > 0) {
    return profile.portraits;
  }
  return profile.portrait ? [profile.portrait] : [];
}

function groupTools(skills: Profile["skills"]) {
  const byGroup = new Map<string, Profile["skills"]>();
  for (const group of toolOrder) {
    byGroup.set(group, []);
  }
  for (const skill of skills) {
    const list = byGroup.get(skill.group);
    if (!list) continue;
    list.push(skill);
  }
  return Array.from(byGroup.entries()).filter(([, items]) => items.length > 0);
}
