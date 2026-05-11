import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { MediaFrame } from "@/components/placeholders/media-frame";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { getTranslations } from "next-intl/server";
import { mediaItems } from "@/content/media";
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

export default async function MediaPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Media" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <SectionHeading
            as="h1"
            eyebrow={t("eyebrow")}
            title={tMeta("mediaTitle")}
            description={tMeta("mediaDescription")}
          />
          <PlaceholderVideo label={t("featuredTbd")} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {mediaItems.length === 0 ? (
          <EmptyArchiveState title={t("emptyTitle")} description={t("emptyDescription")} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {mediaItems.map((item) => (
              <Card key={item.slug} className="overflow-hidden bg-card/80">
                {item.format === "video" || item.format === "reel" ? (
                  <PlaceholderVideo label={t("videoPosterTbd")} className="rounded-none border-0 border-b" />
                ) : (
                  <PlaceholderImage label={t("mediaFrameTbd")} aspect="aspect-video" className="rounded-none border-0 border-b" />
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
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <MediaFrame eyebrow={t("posterEyebrow")} label={t("posterReplaceLabel")}>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PlaceholderImage key={index} label={t("posterTbd")} aspect="aspect-3/4" />
            ))}
          </div>
        </MediaFrame>
      </section>
    </PageShell>
  );
}
