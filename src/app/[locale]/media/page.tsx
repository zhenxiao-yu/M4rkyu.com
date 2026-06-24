import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlurImage } from "@/components/ui/blur-image";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { MediaFrame } from "@/components/placeholders/media-frame";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMediaSource } from "@/lib/media/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

// Content status → Badge tone, so the metadata row actually reads (every
// item shared one amber `warning` chip before). Resolves every enum value.
const STATUS_VARIANT = {
  ready: "success",
  draft: "warning",
  placeholder: "warning",
  "coming-soon": "signal",
} as const;

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
  setRequestLocale(locale);
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
        effects={
          <>
            {/* Screening-room glow + CRT scanlines — the same juiced-hero
              * treatment /games gets, so MEDIA reads as a projection surface
              * instead of a bare header. Static, aria-hidden, single accent. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 55% at 50% 0%, color-mix(in srgb, var(--ring) 14%, transparent), transparent 65%)",
              }}
            />
            <div
              aria-hidden="true"
              className="scanline-layer pointer-events-none absolute inset-0 opacity-50 mask-[linear-gradient(to_bottom,transparent,black_30%,black_75%,transparent)]"
            />
          </>
        }
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
                className="group overflow-hidden bg-card/80 transition-[border-color,box-shadow] duration-(--motion-medium) ease-(--ease-premium) hover:border-ring/50 hover:shadow-lg hover:shadow-ring/6"
              >
                {item.poster ? (
                  <div className="relative aspect-video border-b">
                    <BlurImage
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
                    className="rounded-none border-0 border-b transition-transform duration-(--motion-medium) ease-(--ease-premium) motion-safe:pointer-fine:group-hover:scale-[1.02]"
                  />
                ) : (
                  <PlaceholderImage
                    label={t("mediaFrameTbd")}
                    aspect="aspect-video"
                    className="rounded-none border-0 border-b transition-transform duration-(--motion-medium) ease-(--ease-premium) motion-safe:pointer-fine:group-hover:scale-[1.02]"
                  />
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{item.format}</Badge>
                    <Badge variant={STATUS_VARIANT[item.status]}>
                      {item.status}
                    </Badge>
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
