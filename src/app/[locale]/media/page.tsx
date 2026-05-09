import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { MediaFrame } from "@/components/placeholders/media-frame";
import { mediaItems } from "@/content/media";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Media",
  description: "Draft media and video archive for M4rkyu.com.",
};

export default async function MediaPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <SectionHeading
            as="h1"
            eyebrow="video / process"
            title="Media"
            description="A lightweight media archive layout with still posters and no autoplay. Final clips, posters, and captions can replace the placeholder frames later."
          />
          <PlaceholderVideo label="FEATURED VIDEO TBD" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {mediaItems.map((item) => (
            <Card key={item.slug} className="overflow-hidden bg-card/80">
              {item.format === "video" || item.format === "reel" ? (
                <PlaceholderVideo label="VIDEO POSTER TBD" className="rounded-none border-0 border-b" />
              ) : (
                <PlaceholderImage label="MEDIA FRAME TBD" aspect="aspect-video" className="rounded-none border-0 border-b" />
              )}
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{item.format}</Badge>
                  <Badge variant="warning">{item.status}</Badge>
                  {item.duration ? <Badge variant="outline">{item.duration}</Badge> : null}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <MediaFrame eyebrow="poster system" label="REPLACE WITH FINAL CONTENT">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PlaceholderImage key={index} label="POSTER TBD" aspect="aspect-[3/4]" />
            ))}
          </div>
        </MediaFrame>
      </section>
    </PageShell>
  );
}
