import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { PinnedPostCard } from "@/components/cards/pinned-post-card";
import { FadeIn } from "@/components/motion/fade-in";
import { posts } from "@/content/posts";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
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
  const pinned = posts.find((post) => post.pinned);
  const timelinePosts = posts.filter((post) => !post.pinned);

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow={t("eyebrow")}
              title={t("title")}
              description={t("description")}
            />
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
