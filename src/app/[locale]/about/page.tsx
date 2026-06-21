import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutSignalsCard } from "@/components/about/about-signals-card";
import { DossierDebrief } from "@/components/about/dossier/dossier-debrief";
import {
  DossierFieldGrid,
  type DossierFieldRow,
} from "@/components/about/dossier/dossier-field-grid";
import { DossierFile } from "@/components/about/dossier/dossier-file";
import { DossierPanel } from "@/components/about/dossier/dossier-panel";
import { DossierSignoff } from "@/components/about/dossier/dossier-signoff";
import { DossierSubject } from "@/components/about/dossier/dossier-subject";
import { TimelineTrack } from "@/components/about/timeline-track";
import { ToolsCollapsibleCard } from "@/components/about/tools-collapsible-card";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import type { Profile } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { getProfileSource } from "@/lib/profile/source";
import { buildAlternates } from "@/lib/seo/alternates";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

// Skill groups, in the order they read down the LOADOUT field.
const toolOrder = ["Code", "Data", "Creative", "Workflow"];

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
  const t = await getTranslations({ locale, namespace: "About.dossier" });
  const profile = await getProfileSource();
  const toolGroups = groupTools(profile.skills);
  const countryCount = new Set(profile.cities.map((city) => city.country)).size;

  // IDENTITY exhibit — labels are curated copy; values mix copy with the
  // data-driven facts (location, email) so the grid never drifts from source.
  const identityRows: DossierFieldRow[] = [
    { label: t("fieldFile"), value: t("fieldFileValue") },
    { label: t("fieldDesignation"), value: t("designation") },
    { label: t("fieldBase"), value: profile.location },
    { label: t("fieldOrigin"), value: t("fieldOriginValue") },
    { label: t("fieldClearance"), value: t("fieldClearanceValue") },
    {
      label: t("fieldContact"),
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    { label: t("fieldPhoto"), value: t("fieldPhotoPending"), muted: true },
  ];
  const coverageStats = [
    { value: profile.cities.length, label: t("coverageCities") },
    { value: countryCount, label: t("coverageCountries") },
    { value: profile.skills.length, label: t("coverageSystems") },
  ];

  return (
    <PageShell locale={locale}>
      <PageSection className="py-10 sm:py-14 lg:py-16">
        <DossierFile>
          <DossierSubject
            eyebrow={t("subjectEyebrow")}
            fileTag={t("fileTag")}
            name={profile.name}
            designation={t("designation")}
            baseLabel={t("baseLabel")}
            baseArc={t("baseArc")}
            statusLabel={t("statusLabel")}
            statusAria={t("statusAria")}
            seeWork={t("seeWork")}
            sayHello={t("sayHello")}
          />

          <DossierPanel
            fieldNo={t("identityFieldNo")}
            label={t("identityLabel")}
            subhead={t("identitySubhead")}
          >
            <DossierFieldGrid
              rows={identityRows}
              coverageLabel={t("fieldCoverage")}
              stats={coverageStats}
            />
          </DossierPanel>

          <DossierPanel
            fieldNo={t("routeFieldNo")}
            label={t("routeLabel")}
            subhead={t("routeSubhead")}
          >
            <TimelineTrack
              timeline={profile.timeline}
              nowLabel={t("routeNow")}
              nowBody={t("routeNowBody")}
            />
          </DossierPanel>

          <DossierPanel
            fieldNo={t("loadoutFieldNo")}
            label={t("loadoutLabel")}
            title={t("loadoutTitle")}
            subhead={t("loadoutSubhead")}
          >
            <ToolsCollapsibleCard groups={toolGroups} bare />
          </DossierPanel>

          <DossierPanel
            fieldNo={t("telemetryFieldNo")}
            label={t("telemetryLabel")}
            title={t("telemetryTitle")}
            subhead={t("telemetrySubhead")}
          >
            <AboutSignalsCard bare />
          </DossierPanel>

          <DossierPanel
            fieldNo={t("debriefFieldNo")}
            label={t("debriefLabel")}
            title={t("debriefTitle")}
            tone="plain"
          >
            <DossierDebrief
              paragraphs={[t("debriefP1"), t("debriefP2"), t("debriefP3")]}
              principlesLabel={t("principlesLabel")}
              values={profile.values}
            />
          </DossierPanel>

          <DossierPanel
            fieldNo={t("signoffFieldNo")}
            label={t("signoffLabel")}
            tone="plain"
          >
            <DossierSignoff
              title={t("signoffTitle")}
              body={t("signoffBody")}
              whoami={t("signoffWhoami")}
              seeWork={t("seeWork")}
              sayHello={t("sayHello")}
            />
          </DossierPanel>
        </DossierFile>
      </PageSection>
    </PageShell>
  );
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
