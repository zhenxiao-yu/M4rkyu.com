import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { CollectionFlowMenu } from "@/components/gallery/collection-flow-menu";
import {
  COLLECTION_PLACE_QUERIES,
  pinnedRank,
} from "@/content/gallery-curation";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { getGallerySource } from "@/lib/gallery/source";
import { cn, FOCUS_RING } from "@/lib/utils";
import { GalleryGrid } from "./_client";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly. Per-user saved state moved
// client-side (useGallerySaves), so this no longer reads request cookies.
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
    title: tMeta("galleryTitle"),
    description: tMeta("galleryDescription"),
    alternates: buildAlternates(locale, "/archive"),
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Gallery" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const { collections, items } = await getGallerySource();

  const featuredFrames = items.filter((item) => item.featured).slice(0, 8);

  // Pinned collections lead (Artworks first, curated in gallery-curation),
  // then featured, then source order. Stable sort keeps source order within
  // each tier, so the index stays predictable as more collections land.
  const orderedCollections = [...collections].sort((a, b) => {
    const pinDelta = pinnedRank(a.slug) - pinnedRank(b.slug);
    if (pinDelta !== 0) return pinDelta;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return 0;
  });

  // Real frame count per collection, derived from the actual items on the
  // page (honest for both the DB and static-fallback sources) instead of a
  // hardcoded collection.count that can advertise frames that don't exist.
  const countByCollection = items.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.collection] = (acc[item.collection] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("galleryTitle")}
        description={t("description")}
        decorativeWord="ARCHIVE"
        meta={
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            <span>{t("framesCount", { count: items.length })}</span>
            <span aria-hidden="true">·</span>
            <Link
              href="/archive/saved"
              locale={locale}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-md text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring",
                FOCUS_RING,
              )}
            >
              {t("viewSaved")}
              <ArrowUpRight aria-hidden="true" className="size-3" />
            </Link>
          </div>
        }
      />

      {/* Collections catalogue — an editorial flow-menu of big-type rows, one
       * per set, that flood with a marquee of their own frames on hover
       * (pointer-fine + motion only; clean tappable links otherwise). Featured
       * sets lead. When no ready collection exists yet, an honest empty-state
       * stands in. */}
      <PageSection>
        {orderedCollections.length > 0 ? (
          <>
            <SectionHeading
              eyebrow={t("collectionsEyebrow")}
              title={t("collectionsTitle", { count: orderedCollections.length })}
              description={t("collectionsDescription")}
            />
            <div className="mt-8">
              <CollectionFlowMenu
                collections={orderedCollections}
                counts={countByCollection}
                placeQueries={COLLECTION_PLACE_QUERIES}
                locale={locale}
              />
            </div>
          </>
        ) : (
          <EmptyArchiveState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
      </PageSection>

      {/* Featured frames — individual artwork, opens the lightbox. */}
      {featuredFrames.length > 0 ? (
        <PageSection tone="muted">
          <SectionHeading
            eyebrow={t("mediaGridEyebrow")}
            title={t("mediaGridTitle")}
            description={t("mediaGridDescription")}
          />
          <div className="mt-8">
            {/* GalleryGrid reads ?frame= via useSearchParams; Suspense is
             * required under static rendering. */}
            <Suspense fallback={null}>
              <GalleryGrid
                items={featuredFrames}
                locale={locale}
                variant="bare"
                showHint={false}
              />
            </Suspense>
          </div>
        </PageSection>
      ) : null}
    </PageShell>
  );
}
