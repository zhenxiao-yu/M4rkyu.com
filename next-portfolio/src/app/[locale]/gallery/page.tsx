import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { galleryCollections } from "@/content/gallery";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="visual archive"
          title="Gallery"
          description="Static collection architecture first; optimized thumbnails and lightbox arrive next."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {galleryCollections.map((collection) => (
            <Link key={collection.slug} href={`/gallery/${collection.slug}`} locale={locale}>
              <Card className="h-full transition-colors hover:border-ring">
                <CardHeader>
                  <CardTitle>{collection.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  {collection.description}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
