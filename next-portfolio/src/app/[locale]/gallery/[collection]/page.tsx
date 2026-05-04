import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { galleryCollections, galleryItems } from "@/content/gallery";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return galleryCollections.flatMap((collection) => [
    { locale: "en", collection: collection.slug },
    { locale: "zh", collection: collection.slug },
  ]);
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

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="collection" title={item.title} description={item.description} />
        <div className="mt-8 flex flex-wrap gap-2">
          <Badge variant="outline">{item.count} planned frames</Badge>
          <Badge variant="warning">{item.status}</Badge>
          <Badge variant="outline">Final images TBD</Badge>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((entry, index) => (
            <Card key={entry.slug} className="overflow-hidden bg-card/80">
              <PlaceholderImage
                label={index % 2 === 0 ? "COLLECTION IMAGE TBD" : "PROCESS FRAME TBD"}
                aspect="aspect-[4/5]"
                className="rounded-none border-0 border-b"
              />
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{entry.type}</Badge>
                  <Badge variant="warning">{entry.status}</Badge>
                </div>
                <CardTitle className="text-base leading-tight">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {entry.caption}
              </CardContent>
            </Card>
          ))}
          {Array.from({ length: Math.max(0, Math.min(item.count, 8) - items.length) }).map((_, index) => (
            <PlaceholderImage
              key={index}
              label="MEDIA TBD"
              aspect="aspect-[4/5]"
              className="rounded-lg"
            />
          ))}
        </div>
        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyArchiveState
              title="Collection media pending"
              description="Placeholder empty state: final gallery images will be added after optimization and metadata review."
            />
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
