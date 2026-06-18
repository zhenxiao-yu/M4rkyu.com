import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { BlurImage } from "@/components/ui/blur-image";
import { Carousel } from "@/components/ui/magic/carousel";
import { FadeIn } from "@/components/motion/fade-in";
import { Link } from "@/i18n/navigation";
import type { GalleryCollection } from "@/content/schemas";
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

  const featuredCollections = collections.filter((c) => c.featured);
  const carouselCollections =
    featuredCollections.length > 0
      ? featuredCollections
      : collections.slice(0, 3);
  const featuredFrames = items.filter((item) => item.featured).slice(0, 8);

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

      {/* Featured spotlight — rotating cover banners of the headline
       * collections. Autoplay pauses on hover / reduced-motion. */}
      {carouselCollections.length > 0 ? (
        <PageSection>
          <FadeIn>
            <SectionHeading
              eyebrow={t("featuredEyebrow")}
              title={t("featuredTitle")}
              description={t("featuredDescription")}
            />
          </FadeIn>
          <div className="mt-8">
            <Carousel
              ariaLabel={t("featuredTitle")}
              autoplayDelay={6500}
              controlLabels={{ prev: t("carouselPrev"), next: t("carouselNext") }}
              slideLabels={carouselCollections.map((c) => c.title)}
            >
              {carouselCollections.map((collection) => (
                <CollectionBanner
                  key={collection.slug}
                  collection={collection}
                  countLabel={t("framesCount", {
                    count: countByCollection[collection.slug] ?? 0,
                  })}
                  enterLabel={t("viewCollection")}
                  locale={locale}
                />
              ))}
            </Carousel>
          </div>
        </PageSection>
      ) : null}

      {/* Browse collections — cover cards into each set's masonry. */}
      <PageSection tone="muted">
        <FadeIn>
          <SectionHeading
            eyebrow={t("collectionsEyebrow")}
            title={t("collectionsTitle", { count: collections.length })}
            description={t("collectionsDescription")}
          />
        </FadeIn>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCoverCard
              key={collection.slug}
              collection={collection}
              countLabel={t("framesCount", {
                count: countByCollection[collection.slug] ?? 0,
              })}
              locale={locale}
            />
          ))}
        </div>
      </PageSection>

      {/* Featured frames — individual artwork, opens the lightbox. */}
      {featuredFrames.length > 0 ? (
        <PageSection>
          <FadeIn>
            <SectionHeading
              eyebrow={t("mediaGridEyebrow")}
              title={t("mediaGridTitle")}
              description={t("mediaGridDescription")}
            />
          </FadeIn>
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

function hasRealCover(collection: GalleryCollection): boolean {
  return Boolean(collection.cover?.src?.includes("/storage/"));
}

function focalPosition(focal: GalleryCollection["cover"]["focal"]): string {
  if (focal === "top") return "center top";
  if (focal === "bottom") return "center bottom";
  return "center";
}

function CollectionBanner({
  collection,
  countLabel,
  enterLabel,
  locale,
}: {
  collection: GalleryCollection;
  countLabel: string;
  enterLabel: string;
  locale: Locale;
}) {
  const cover = hasRealCover(collection) ? collection.cover : null;
  return (
    <Link
      href={`/archive/${collection.slug}`}
      locale={locale}
      aria-label={collection.title}
      className={cn(
        "group relative block aspect-16/9 overflow-hidden rounded-lg border border-border bg-card sm:aspect-21/9",
        FOCUS_RING,
      )}
    >
      {cover ? (
        <BlurImage
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 1024px) 80rem, 100vw"
          className="object-cover grayscale transition duration-(--motion-medium) ease-(--ease-premium) group-hover:grayscale-0"
          style={{ objectPosition: focalPosition(cover.focal) }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-cyber-grid opacity-40" />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/45 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 sm:p-8">
        <Badge
          variant="outline"
          className="w-fit bg-background/70 font-mono text-[0.6rem] uppercase tracking-[0.18em] backdrop-blur-sm"
        >
          {countLabel}
        </Badge>
        <h3 className="max-w-xl text-balance font-display text-2xl font-semibold leading-tight sm:text-4xl">
          {collection.title}
        </h3>
        <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {collection.description}
        </p>
        <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground">
          {enterLabel}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
          />
        </span>
      </div>
    </Link>
  );
}

function CollectionCoverCard({
  collection,
  countLabel,
  locale,
}: {
  collection: GalleryCollection;
  countLabel: string;
  locale: Locale;
}) {
  const cover = hasRealCover(collection) ? collection.cover : null;
  return (
    <Link
      href={`/archive/${collection.slug}`}
      locale={locale}
      aria-label={collection.title}
      className={cn(
        "group relative block aspect-4/5 overflow-hidden rounded-lg border border-border bg-card transition-[border-color,box-shadow,transform] duration-(--motion-base) ease-(--ease-premium) hover:border-ring hover:shadow-md motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
      )}
    >
      {cover ? (
        <BlurImage
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover grayscale transition duration-(--motion-medium) ease-(--ease-premium) group-hover:grayscale-0"
          style={{ objectPosition: focalPosition(cover.focal) }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 contact-sheet opacity-50" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background/92 via-background/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="bg-background/70 font-mono text-[0.6rem] uppercase tracking-[0.18em] backdrop-blur-sm"
          >
            {countLabel}
          </Badge>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring"
          />
        </div>
        <h3 className="text-balance font-display text-lg font-semibold leading-tight">
          {collection.title}
        </h3>
        {collection.mood.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {collection.mood.slice(0, 3).map((mood) => (
              <span
                key={mood}
                className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground"
              >
                #{mood}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
