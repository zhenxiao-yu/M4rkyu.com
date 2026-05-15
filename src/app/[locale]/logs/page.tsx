import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PinnedPostCard } from "@/components/cards/pinned-post-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { getPosts, DEVTO_USERNAME } from "@/lib/blog/get-posts";
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
  const timelinePosts = posts.filter((post) => !post.pinned);

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
                className="rounded-sm text-foreground underline-offset-4 transition-colors hover:text-ring hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                dev.to / @{DEVTO_USERNAME}
              </a>
            </p>
            <p>{t("syndicatedNote")}</p>
          </CardContent>
        </Card>
      </PageHero>

      {pinned ? (
        <PageSection width="narrow" innerClassName="pb-0">
          <FadeIn>
            <PinnedPostCard post={pinned} />
          </FadeIn>
        </PageSection>
      ) : null}

      <PageSection width="narrow" innerClassName={pinned ? "pt-10" : undefined}>
        <FadeIn>
          <BlogTimeline posts={timelinePosts} />
        </FadeIn>
      </PageSection>
    </PageShell>
  );
}
