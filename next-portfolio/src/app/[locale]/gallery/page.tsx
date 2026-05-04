import { ArchiveCard } from "@/components/cards/archive-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { galleryCollections, galleryItems } from "@/content/gallery";
import type { Locale } from "@/i18n/routing";

export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="visual archive"
            title="Gallery"
            description="A black-and-white gallery shell with placeholder media, collection filters, and lightbox-ready framing. Final images replace these frames after optimization."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {galleryCollections.map((collection) => (
            <Badge key={collection.slug} variant="outline">
              {collection.title}
            </Badge>
          ))}
          <Badge variant="warning">Draft media</Badge>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {galleryCollections.map((collection) => (
            <ArchiveCard
              key={collection.slug}
              title={collection.title}
              description={collection.description}
              eyebrow={`${collection.count} frames`}
              status={collection.status}
              href={`/gallery/${collection.slug}`}
              locale={locale}
              mediaLabel="COLLECTION COVER TBD"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="contact sheet"
            title="Draft media grid"
            description="Placeholder states are treated as exhibit frames, not broken content."
          />
          <ContentPendingLabel label="LIGHTBOX READY" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item, index) => (
            <Dialog key={item.slug}>
              <DialogTrigger asChild>
                <button className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="overflow-hidden bg-card/80 transition-colors group-hover:border-ring">
                    <PlaceholderImage
                      label={index % 2 === 0 ? "GALLERY IMAGE TBD" : "CONTACT SHEET TBD"}
                      aspect="aspect-[4/5]"
                      className="rounded-none border-0 border-b"
                    />
                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="warning">{item.status}</Badge>
                      </div>
                      <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{item.title}</DialogTitle>
                </DialogHeader>
                <PlaceholderImage label="LIGHTBOX MEDIA TBD" aspect="aspect-[4/3]" />
                <p className="text-sm leading-6 text-muted-foreground">{item.caption}</p>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
