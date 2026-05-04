import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { galleryCollections } from "@/content/gallery";
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

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="collection" title={item.title} description={item.description} />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: Math.min(item.count, 8) }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] rounded-lg border bg-cyber-grid bg-muted"
              aria-label={`${item.title} placeholder ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
