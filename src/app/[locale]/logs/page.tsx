import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { FeaturedPostsBento } from "@/components/blog/featured-posts-bento";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";
import { getPosts, DEVTO_USERNAME } from "@/lib/blog/get-posts";
import { selectFeaturedPosts } from "@/lib/blog/filter-posts";
import { BlogTimeline } from "./_client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/logs"),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = await getPosts();
  const pinned = posts.find((post) => post.pinned);
  const featuredPosts = selectFeaturedPosts(posts, pinned);
  const featuredSlugs = new Set(featuredPosts.map((post) => post.slug));
  // Keep featured posts out of the archive timeline so readers do not see duplicates.
  const archivePosts = posts.filter((post) => !featuredSlugs.has(post.slug));

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="LOGS"
      >
        <Card className="bg-background/70 shadow-lg shadow-black/5 backdrop-blur-xl hover:border-ring/50 dark:shadow-black/20">
          <CardHeader>
            <CardTitle as="h2">{t("archiveStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-mono text-foreground">{posts.length}</span>{" "}
              {t("postsPublished")}
            </p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em]">
              {t("syndicatedFrom")}{" "}
              <a
                href={`https://dev.to/${DEVTO_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "rounded-sm text-foreground underline-offset-4 transition-colors hover:text-ring hover:underline",
                  FOCUS_RING,
                )}
              >
                dev.to / @{DEVTO_USERNAME}
              </a>
            </p>
            <p>{t("syndicatedNote")}</p>
          </CardContent>
        </Card>
      </PageHero>

      <PageSection innerClassName="pb-0">
        <FadeIn>
          <FeaturedPostsBento
            posts={featuredPosts}
            heading={t("featuredHeading")}
            description={t("featuredDescription")}
            ctaLabel={t("featuredCta")}
          />
        </FadeIn>
      </PageSection>

      <PageSection innerClassName="pt-10">
        <FadeIn>
          <BlogTimeline posts={archivePosts} />
        </FadeIn>
      </PageSection>
    </PageShell>
  );
}
