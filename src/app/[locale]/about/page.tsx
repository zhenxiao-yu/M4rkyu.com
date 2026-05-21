import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { AboutSignalsCard } from "@/components/about/about-signals-card";
import { BentoFx, BentoGrid } from "@/components/about/bento-fx";
import {
  PortraitStack,
  type PortraitStackItem,
} from "@/components/about/portrait-stack";
import { ToolsCollapsibleCard } from "@/components/about/tools-collapsible-card";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <PageShell locale={locale}>
      <PageSection className="py-14 sm:py-18 lg:py-20">
        <BentoGrid className="grid auto-rows-auto gap-4 md:grid-cols-6 lg:grid-cols-12">
          <BentoFx
            pattern="cyber-grid"
            className="md:col-span-6 lg:col-span-8"
          >
            <Card className="relative h-full overflow-hidden bg-card/85">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ring/50 to-transparent"
              />
              <CardContent className="relative flex min-h-[26rem] flex-col justify-between gap-12 p-6 sm:p-8 lg:p-10">
                <div className="grid gap-5">
                  <p className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                    <MapPin className="size-3" aria-hidden="true" />
                    {profile.location}
                  </p>
                  <div className="grid gap-5">
                    <h1 className="max-w-4xl text-balance font-display text-[clamp(3.25rem,9vw,7.5rem)] font-semibold leading-[0.88] tracking-normal">
                      {t("heroTitle")}
                    </h1>
                    <p className="max-w-xl text-balance text-base leading-8 text-muted-foreground sm:text-lg">
                      {t("heroBody")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/work" locale={locale}>
                      {t("seeWork")}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact" locale={locale}>
                      {t("sayHello")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </BentoFx>

          <BentoFx pattern="dots" className="md:col-span-6 lg:col-span-4">
            <PortraitStack
              eyebrow={t("portraitEyebrow")}
              title={t("portraitTitle")}
              placeholder={t("portraitPlaceholder")}
              previousLabel={t("portraitPrevious")}
              nextLabel={t("portraitNext")}
              items={portraits}
            />
          </BentoFx>

          <BentoFx pattern="dots" className="md:col-span-3 lg:col-span-5">
            <TimelineCard locale={locale} timeline={profile.timeline} />
          </BentoFx>

          <BentoFx pattern="dots" className="md:col-span-3 lg:col-span-7">
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
    <Card className="h-full bg-card/85">
      <CardHeader>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("timelineEyebrow")}
        </p>
        <CardTitle className="text-base">{t("timelineTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid max-h-[16rem] gap-4 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
          {timeline.map((item) => (
            <div key={item.label} className="relative border-l pl-5">
              <span className="absolute -left-1 top-1.5 size-2 rounded-full bg-ring" />
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                {item.date}
              </p>
              <h2 className="mt-1 text-sm font-semibold">{item.label}</h2>
              <p className="mt-1 max-w-[32ch] text-xs leading-5 text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
          <div className="relative border-l border-dashed pl-5">
            <span className="absolute -left-1 top-1.5 size-2 rounded-full border border-ring bg-background" />
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t("timelineNow")}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("timelineNowBody")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function ClosingCard({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "About.refined" });

  return (
    <Card className="h-full bg-card/85">
      <CardContent className="flex h-full min-h-[16rem] flex-col justify-between gap-8 p-6 sm:p-7">
        <div className="grid gap-3">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("closingEyebrow")}
          </p>
          <h2 className="max-w-xl text-balance font-display text-3xl font-semibold leading-tight">
            {t("closingTitle")}
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {t("closingBody")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/contact" locale={locale}>
              {t("sayHello")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/work" locale={locale}>
              {t("seeWork")}
            </Link>
          </Button>
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
