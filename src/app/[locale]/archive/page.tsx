import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { Link } from "@/i18n/navigation";
import { galleryCollections, galleryItems } from "@/content/gallery";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { GalleryGrid } from "./_client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("galleryTitle"),
    description: tMeta("galleryDescription"),
    alternates: buildAlternates(locale, "/archive"),
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Gallery" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      {/* Hero — cinematic eyebrow + title + description, saved-frames
        * jump link inline in the metadata strip. Keeps the cyber-grid
        * + vignette atmosphere the rest of the site uses for index
        * routes. */}
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 bg-cyber-grid opacity-30"
          aria-hidden="true"
        />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow={t("eyebrow")}
              title={tMeta("galleryTitle")}
              description={t("description")}
            />
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              <span>{t("framesCount", { count: galleryItems.length })}</span>
              <span aria-hidden="true">·</span>
              <Link
                href="/archive/saved"
                locale={locale}
                className="inline-flex items-center gap-1.5 text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("viewSaved")}
                <ArrowUpRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Primary surface — contact-sheet grid. The page leads with
        * frames, not with collection cards, because the photographic
        * grid is the page's wow factor per docs/FINAL_SITE_ARCHITECTURE
        * §5.4. */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            eyebrow={t("mediaGridEyebrow")}
            title={t("mediaGridTitle")}
            description={t("mediaGridDescription")}
          />
        </FadeIn>
        <div className="mt-8">
          {/* GalleryGrid renders its own EmptyArchiveState when the
            * collection is empty — no separate empty branch needed. */}
          <GalleryGrid items={galleryItems} locale={locale} />
        </div>
      </section>

      {/* Collections rail — secondary navigation. Compact cards, not
        * the page's main event. Sits below the contact sheet so the
        * page reads: "this is the archive · these are the frames ·
        * here are the groupings if you want them". */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow={t("collectionsEyebrow")}
              title={t("collectionsTitle")}
              description={t("collectionsDescription")}
            />
          </FadeIn>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {galleryCollections.map((collection) => (
              <CollectionRailCard
                key={collection.slug}
                title={collection.title}
                description={collection.description}
                countLabel={t("framesCount", { count: collection.count })}
                href={`/archive/${collection.slug}`}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CollectionRailCard({
  title,
  description,
  countLabel,
  href,
  locale,
}: {
  title: string;
  description: string;
  countLabel: string;
  href: string;
  locale: Locale;
}) {
  return (
    <Link
      href={href}
      locale={locale}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
    >
      <Card className="h-full bg-card/80 transition-[border-color,box-shadow] duration-(--motion-base) ease-(--ease-premium) group-hover:border-ring group-hover:shadow-md">
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
            >
              {countLabel}
            </Badge>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring"
            />
          </div>
          <CardTitle className="text-base leading-tight">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {description}
        </CardContent>
      </Card>
    </Link>
  );
}
