import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
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
    alternates: buildAlternates(locale, "/blog"),
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
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow={t("eyebrow")}
              title={t("title")}
              description={t("description")}
            />
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <Card className="bg-background/70 backdrop-blur">
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
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    dev.to / @{DEVTO_USERNAME}
                  </a>
                </p>
                <p>{t("syndicatedNote")}</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {pinned ? (
        <section className="mx-auto w-full max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
          <FadeIn>
            <PinnedPostCard post={pinned} />
          </FadeIn>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <FadeIn>
          <BlogTimeline posts={timelinePosts} />
        </FadeIn>
      </section>
    </PageShell>
  );
}
