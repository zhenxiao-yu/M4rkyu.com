import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { FeaturedBentoRotator } from "@/components/resources/featured-bento-rotator";
import { LinksExplorer } from "@/components/resources/links-explorer";
import { getResourcesSource } from "@/lib/resources/source";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

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
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("resourcesLinksTitle"),
    description: tMeta("resourcesLinksDescription"),
    alternates: buildAlternates(locale, "/resources/links"),
  };
}

export default async function ResourcesLinksPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Resources" });

  const resources = await getResourcesSource();
  const links = resources.filter(
    (resource) => resource.type === "link" && resource.status === "ready",
  );

  // Featured-first ordering so the spotlight bento opens on the
  // hand-picked entries; the rest of the catalog rotates in after.
  const featured = links.filter((link) => link.featured);
  const rest = links.filter((link) => !link.featured);
  const bentoLinks = [...featured, ...rest];

  const bentoItems = bentoLinks.map((link) => ({
    id: link.slug,
    name: link.name,
    description: link.description,
    href: link.link,
    external: true,
    iconKey: link.iconKey,
    tags: link.tags,
    category: link.category,
  }));

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("LinksPage.eyebrow")}
        title={t("LinksPage.title")}
        description={t("LinksPage.lede")}
        decorativeWord="LINKS"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/resources" locale={locale}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("breadcrumbResources")}
            </Link>
          </Button>
        }
      />

      <PageSection innerClassName="pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10">
        <FeaturedBentoRotator
          items={bentoItems}
          locale={locale}
          labels={{
            eyebrow: t("Bento.linksEyebrow"),
            heading: t("Bento.linksHeading"),
            regionLabel: t("Bento.linksRegionLabel"),
            prev: t("Bento.prev"),
            next: t("Bento.next"),
            pause: t("Bento.pause"),
            play: t("Bento.play"),
            collapse: t("Bento.collapse"),
            expand: t("Bento.expand"),
            openAria: t("openLinkAria", { name: "{name}" }),
            gotoPage: t("Bento.gotoPage", { index: "{index}" }),
            typeBadge: t("type.link"),
          }}
          collapseStorageKey="m4rkyu:resources:bento-links-collapsed"
        />
      </PageSection>

      <PageSection innerClassName="py-8 sm:py-10 lg:py-12">
        <LinksExplorer links={links} />
      </PageSection>
    </PageShell>
  );
}
