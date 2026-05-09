import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/sections/hero-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProjectCard } from "@/components/cards/project-card";
import { ArchiveCard } from "@/components/cards/archive-card";
import { ResourcePreviewCard } from "@/components/cards/resource-preview-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BentoGrid } from "@/components/ui/magic/bento-grid";
import { GalleryBentoTile } from "@/components/gallery/gallery-bento-tile";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import {
  StatusPulseRow,
  type StatusPulseEntry,
} from "@/components/sections/status-pulse-row";
import { WritingPulseRow } from "@/components/sections/writing-pulse-row";
import { ClosingCTAStrip } from "@/components/sections/closing-cta-strip";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { featuredProjects } from "@/content/projects";
import { galleryCollections, galleryItems } from "@/content/gallery";
import { resources } from "@/content/resources";
import { posts } from "@/content/posts";
import { games } from "@/content/games";
import { mediaItems } from "@/content/media";
import { profile } from "@/content/profile";
import { localize } from "@/lib/content/localize";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates(locale, ""),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  // Status pulse — real data only. Skips slots when no honest source exists.
  // Each entry is localized so /zh reads in CJK when the underlying content
  // has a `translations.zh` slice; falls back to the base fields otherwise.
  const statusEntries: StatusPulseEntry[] = [];
  const shipping = featuredProjects.find((p) => p.contentStatus === "ready");
  if (shipping) {
    const localizedShipping = localize(shipping, locale);
    statusEntries.push({
      kind: "shipping",
      label: localizedShipping.title,
      detail: localizedShipping.shortPitch as string,
      href: `/projects/${shipping.slug}`,
    });
  }
  const writing = posts[0];
  if (writing) {
    statusEntries.push({
      kind: "writing",
      label: writing.title,
      detail: writing.excerpt,
      href: `/blog/${writing.slug}`,
    });
  }
  const now = games.find((g) => g.status !== "ready") ?? games[0];
  if (now) {
    const localizedNow = localize(now, locale);
    statusEntries.push({
      kind: "now",
      label: localizedNow.title,
      detail: localizedNow.pitch as string,
      href: `/games/${now.slug}`,
    });
  }

  const writingLatest = posts[0];
  const writingDevlog = posts.find((p) =>
    p.category.toLowerCase().includes("devlog"),
  );
  const featuredResources = resources.slice(0, 3);
  const readyFrames = galleryItems.filter((item) => item.status === "ready");
  const bentoFrames = readyFrames.length >= 4 ? readyFrames.slice(0, 4) : null;

  return (
    <PageShell locale={locale}>
      <HeroSection locale={locale} />

      {/* Status pulse — what's shipping / writing / next */}
      {statusEntries.length > 0 ? (
        <section className="border-b bg-muted/20">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <FadeIn>
              <StatusPulseRow current={statusEntries} />
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* Featured projects */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="selected systems"
              title={t("featured")}
              description={t("featuredDescription")}
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/projects" locale={locale}>
                {t("fullArchive")}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
        <Stagger className="mt-10 grid gap-5 md:grid-cols-3" delay={0.1}>
          {featuredProjects.slice(0, 3).map((project, index) => (
            <StaggerItem key={project.slug}>
              <ProjectCard
                project={project}
                locale={locale}
                highlighted={index === 0}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Writing pulse */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="writing pulse"
              title={t("latest")}
              description={t("latestDescription")}
            />
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-8">
              <WritingPulseRow
                posts={{ latest: writingLatest, devlog: writingDevlog }}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Tools / resources strip */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={t("toolsEyebrow")}
              title={t("tools")}
              description={t("toolsDescription")}
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/resources" locale={locale}>
                {t("fullStack")}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
        <Stagger className="mt-10 grid gap-5 md:grid-cols-3" delay={0.08}>
          {featuredResources.map((resource) => (
            <StaggerItem key={resource.slug}>
              <ResourcePreviewCard resource={resource} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Gallery preview */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <FadeIn direction="right">
            <SectionHeading
              eyebrow="visual archive"
              title={t("gallery")}
              description={t("galleryDescription")}
            />
            <Button asChild variant="outline" className="mt-8">
              <Link href="/gallery" locale={locale}>
                {t("openGallery")}
              </Link>
            </Button>
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            {bentoFrames ? (
              <BentoGrid className="lg:auto-rows-[12rem] lg:grid-cols-2">
                {bentoFrames.map((item, index) => (
                  <GalleryBentoTile
                    key={item.slug}
                    item={item}
                    span={index === 0 ? "sm:row-span-2" : undefined}
                  />
                ))}
              </BentoGrid>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {galleryCollections.slice(0, 2).map((collection) => (
                  <ArchiveCard
                    key={collection.slug}
                    title={collection.title}
                    description={collection.description}
                    eyebrow={`${collection.count} frames`}
                    status={collection.status}
                    href={`/gallery/${collection.slug}`}
                    locale={locale}
                    mediaLabel="GALLERY MEDIA TBD"
                  />
                ))}
                <Card className="bg-card/80 sm:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("openGallery")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">
                    {t("contactSheetPlaceholder")}
                  </CardContent>
                </Card>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Media lane */}
      <section>
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="media lane"
              title={t("media")}
              description={t("mediaDescription")}
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {mediaItems.slice(0, 2).map((item) => (
                <Card key={item.slug} className="bg-card/80">
                  <CardHeader>
                    <Badge variant="warning">{item.status}</Badge>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <PlaceholderVideo label="HOMEPAGE REEL TBD" />
          </FadeIn>
        </div>
      </section>

      {/* Closing strip */}
      <ClosingCTAStrip
        statement={t("closingStatement")}
        primary={{ label: t("primaryCta"), href: "/projects" }}
        secondary={{ label: t("emailDirectly"), mailto: profile.email }}
      />
    </PageShell>
  );
}
