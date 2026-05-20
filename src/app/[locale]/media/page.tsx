import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { MediaFrame } from "@/components/placeholders/media-frame";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { getTranslations } from "next-intl/server";
import { getMediaSource } from "@/lib/media/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("mediaTitle"),
    description: tMeta("mediaDescription"),
    alternates: buildAlternates(locale, "/media"),
  };
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Media" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const mediaItems = await getMediaSource();

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("mediaTitle")}
        description={tMeta("mediaDescription")}
        decorativeWord="MEDIA"
        sidecarClassName="w-full"
      >
        <PlaceholderVideo label={t("featuredTbd")} />
      </PageHero>

      <PageSection>
        {mediaItems.length === 0 ? (
          <EmptyArchiveState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {mediaItems.map((item) => (
              <Card
                key={item.slug}
                className="overflow-hidden bg-card/80 hover:border-ring/50 hover:shadow-md"
              >
                {item.poster ? (
                  <div className="relative aspect-video border-b">
                    <Image
                      src={item.poster.src}
                      alt={item.poster.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : item.format === "video" || item.format === "reel" ? (
                  <PlaceholderVideo
                    label={t("videoPosterTbd")}
                    className="rounded-none border-0 border-b"
                  />
                ) : (
                  <PlaceholderImage
                    label={t("mediaFrameTbd")}
                    aspect="aspect-video"
                    className="rounded-none border-0 border-b"
                  />
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{item.format}</Badge>
                    <Badge variant="warning">{item.status}</Badge>
                    {item.duration ? (
                      <Badge variant="outline">{item.duration}</Badge>
                    ) : null}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection innerClassName="pt-0">
        <MediaFrame
          eyebrow={t("posterEyebrow")}
          label={t("posterReplaceLabel")}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PlaceholderImage
                key={index}
                label={t("posterTbd")}
                aspect="aspect-3/4"
              />
            ))}
          </div>
        </MediaFrame>
      </PageSection>
    </PageShell>
  );
}
