import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutBento } from "@/components/about/about-bento";
import { AboutHeroScene } from "@/components/about/about-hero-scene";
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

// Skill groups, in the order they read across the LOADOUT tile.
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
  const profile = await getProfileSource();
  const toolGroups = groupTools(profile.skills);

  return (
    <PageShell locale={locale}>
      {/* Scene 1 — cinematic hero (full-viewport), hands off on scroll. */}
      <AboutHeroScene
        portraits={profile.portraits}
        location={profile.location}
      />
      {/* Scene 2 — the living bento dashboard. */}
      <PageSection className="py-8 sm:py-10 lg:py-12">
        <AboutBento toolGroups={toolGroups} currently={profile.currently} />
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
