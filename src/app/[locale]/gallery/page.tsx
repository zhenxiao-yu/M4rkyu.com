import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ArchiveCard } from "@/components/cards/archive-card"
import { PageShell } from "@/components/layout/page-shell"
import { SectionHeading } from "@/components/sections/section-heading"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/motion/fade-in"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { galleryCollections, galleryItems } from "@/content/gallery"
import type { Locale } from "@/i18n/routing"
import { buildAlternates } from "@/lib/seo/alternates"
import { GalleryGrid } from "./_client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const tMeta = await getTranslations({ locale, namespace: "Meta" })
  return {
    title: tMeta("galleryTitle"),
    description: tMeta("galleryDescription"),
    alternates: buildAlternates(locale, "/gallery"),
  }
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow="visual archive"
              title="Gallery"
              description="Black-and-white photography, digital art, and contact sheets. Placeholder frames hold the structure while final media is optimised."
            />
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-wrap gap-2">
            {galleryCollections.map((collection) => (
              <Badge key={collection.slug} variant="outline">
                {collection.title}
              </Badge>
            ))}
          </div>
        </FadeIn>
        <Stagger className="mt-8 grid gap-5 md:grid-cols-3" delay={0.08}>
          {galleryCollections.map((collection) => (
            <StaggerItem key={collection.slug}>
              <ArchiveCard
                title={collection.title}
                description={collection.description}
                eyebrow={`${collection.count} frames`}
                status={collection.status}
                href={`/gallery/${collection.slug}`}
                locale={locale}
                mediaLabel="COLLECTION COVER TBD"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            eyebrow="contact sheet"
            title="Media grid"
            description="Each frame is lightbox-ready — click to open, arrow keys to navigate."
          />
        </FadeIn>
        <div className="mt-8">
          <GalleryGrid items={galleryItems} locale={locale} />
        </div>
      </section>
    </PageShell>
  )
}
