import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { BlurImage } from "@/components/ui/blur-image";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { GalleryMasonry } from "@/components/gallery/gallery-masonry";
import { getGallerySource } from "@/lib/gallery/source";
import type { GalleryCollection } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly. Per-user saved state moved
// client-side (useGallerySaves), so this no longer reads request cookies.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; collection: string }>;
}): Promise<Metadata> {
  const { locale, collection } = await params;
  const { collections } = await getGallerySource();
  const item = collections.find((entry) => entry.slug === collection);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    alternates: buildAlternates(locale, `/archive/${collection}`),
  };
}

export default async function GalleryCollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; collection: string }>;
}) {
  const { locale, collection } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Gallery" });
  const { collections, items } = await getGallerySource();

  const item = collections.find((entry) => entry.slug === collection);
  if (!item) notFound();

  const frames = items.filter((entry) => entry.collection === item.slug);
  // Only render a cover panel when a real uploaded image exists (the
  // source falls back to a `/gallery/<slug>.svg` path that may not).
  const cover = item.cover?.src?.includes("/storage/") ? item.cover : null;

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("collectionEyebrow")}
        title={item.title}
        description={item.description}
        decorativeWord="SET"
        disableGlitch
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
            >
              {t("framesCount", { count: frames.length })}
            </Badge>
            {item.mood.map((mood) => (
              <Badge
                key={mood}
                variant="outline"
                className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
              >
                {mood}
              </Badge>
            ))}
          </div>
        }
      >
        {cover ? (
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
            <BlurImage
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="object-cover"
              style={{ objectPosition: focalPosition(cover.focal) }}
            />
          </div>
        ) : null}
      </PageHero>

      <PageSection>
        {/* GalleryMasonry reads ?frame= via useSearchParams; Suspense is
         * required under static rendering. */}
        <Suspense fallback={null}>
          <GalleryMasonry items={frames} locale={locale} />
        </Suspense>
      </PageSection>
    </PageShell>
  );
}

function focalPosition(focal: GalleryCollection["cover"]["focal"]): string {
  if (focal === "top") return "center top";
  if (focal === "bottom") return "center bottom";
  return "center";
}
