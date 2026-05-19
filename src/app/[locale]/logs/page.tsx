import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { FeaturedPostsRotator } from "@/components/blog/featured-posts-rotator";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";
import { getPosts, DEVTO_USERNAME } from "@/lib/blog/get-posts";
import { selectFeaturedPosts } from "@/lib/blog/filter-posts";
import { BlogTimeline } from "./_client";

// Pull enough featured posts for a full rotator page. `selectFeaturedPosts`
// only respects `BLOG_PAGE_SETTINGS.featuredPostCount`, so we widen the
// candidate pool ourselves: a pinned post plus the highest-scoring 6
// candidates. Fewer dev.to posts → the rotator falls back to its static
// mode automatically.
const ROTATOR_PAGE_SIZE = 7;

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
  // Widen the candidate pool just for the rotator (one full mosaic
  // page = 7 tiles). The global BLOG_PAGE_SETTINGS stays at 3 so the
  // legacy /logs surfaces that read it keep their previous behaviour.
  const featuredPosts = selectFeaturedPosts(posts, pinned, ROTATOR_PAGE_SIZE);
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

      <PageSection innerClassName="pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10">
        <FadeIn>
          <FeaturedPostsRotator
            posts={featuredPosts}
            locale={locale}
            labels={{
              eyebrow: t("featuredRotatorEyebrow"),
              heading: t("featuredHeading"),
              regionLabel: t("featuredRotatorLabel"),
              prev: t("featuredRotatorPrev"),
              next: t("featuredRotatorNext"),
              pause: t("featuredRotatorPause"),
              play: t("featuredRotatorPlay"),
              collapse: t("featuredRotatorCollapse"),
              expand: t("featuredRotatorExpand"),
              gotoPage: t("featuredRotatorGoto", { index: "{index}" }),
              openAria: t("openPostAria", { name: "{name}" }),
              ctaLabel: t("featuredCta"),
            }}
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
