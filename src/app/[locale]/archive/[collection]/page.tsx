import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { galleryCollections, galleryItems } from "@/content/gallery";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

type GalleryTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function generateStaticParams() {
  return galleryCollections.flatMap((collection) => [
    { locale: "en", collection: collection.slug },
    { locale: "zh", collection: collection.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; collection: string }>;
}): Promise<Metadata> {
  const { locale, collection } = await params;
  const item = galleryCollections.find((entry) => entry.slug === collection);
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
  const item = galleryCollections.find((entry) => entry.slug === collection);
  if (!item) notFound();
  const items = galleryItems.filter((entry) => entry.collection === item.slug);
  const t = await getTranslations({ locale, namespace: "Gallery" });
  const tbdLabel = t("frameTbd");

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("collectionEyebrow")}
        title={item.title}
        description={item.description}
        decorativeWord="SET"
        disableGlitch
        meta={<CollectionBadges item={item} t={t} />}
      />
      <PageSection>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((entry) => (
            <Card
              key={entry.slug}
              className="overflow-hidden bg-card/80 hover:border-ring/50 hover:shadow-md"
            >
              <PlaceholderImage
                label={tbdLabel}
                aspect="aspect-4/5"
                className="rounded-none border-0 border-b"
              />
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{entry.type}</Badge>
                  <Badge variant="warning">{entry.status}</Badge>
                </div>
                <CardTitle className="text-base leading-tight">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {entry.caption}
              </CardContent>
            </Card>
          ))}
          {Array.from({
            length: Math.max(0, Math.min(item.count, 8) - items.length),
          }).map((_, index) => (
            <PlaceholderImage
              key={index}
              label={tbdLabel}
              aspect="aspect-4/5"
              className="rounded-lg"
            />
          ))}
        </div>
        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyArchiveState
              title={t("collectionMediaPendingTitle")}
              description={t("collectionMediaPendingDescription")}
            />
          </div>
        ) : null}
      </PageSection>
    </PageShell>
  );
}

function CollectionBadges({
  item,
  t,
}: {
  item: (typeof galleryCollections)[number];
  t: GalleryTranslator;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">
        {t("plannedFramesCount", { count: item.count })}
      </Badge>
      <Badge variant="warning">{item.status}</Badge>
      <Badge variant="outline">{t("finalImagesTbd")}</Badge>
    </div>
  );
}
