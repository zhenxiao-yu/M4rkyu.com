import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { GalleryMasonry } from "@/components/gallery/gallery-masonry";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSavedKeysOfType } from "@/lib/social/saves";
import { getGallerySource } from "@/lib/gallery/source";
import type { GalleryCollection } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

// Data-driven (DB-first via getGallerySource) + reads request cookies
// for save state, so this route renders dynamically.
export const dynamic = "force-dynamic";

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
  const t = await getTranslations({ locale, namespace: "Gallery" });
  const [{ collections, items }, user, savedSlugs] = await Promise.all([
    getGallerySource(),
    getCurrentUser(),
    getSavedKeysOfType("gallery"),
  ]);

  const item = collections.find((entry) => entry.slug === collection);
  if (!item) notFound();

  const frames = items.filter((entry) => entry.collection === item.slug);
  const signedIn = Boolean(user);
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
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="object-cover"
              style={{ objectPosition: focalPosition(cover.focal) }}
            />
          </div>
        ) : null}
      </PageHero>

      <PageSection>
        <GalleryMasonry
          items={frames}
          locale={locale}
          savedSlugs={savedSlugs}
          signedIn={signedIn}
        />
      </PageSection>
    </PageShell>
  );
}

function focalPosition(focal: GalleryCollection["cover"]["focal"]): string {
  if (focal === "top") return "center top";
  if (focal === "bottom") return "center bottom";
  return "center";
}
