import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PostHeader } from "@/components/blog/post-header";
import { PostBody } from "@/components/blog/post-body";
import { RelatedPosts } from "@/components/blog/related-posts";
import { CaseStudyFooter } from "@/components/case-study/case-study-footer";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog/get-post";
import {
  fetchDevtoArticles,
  type DevtoArticleListItem,
} from "@/lib/blog/devto";
import { DEVTO_USERNAME } from "@/lib/blog/get-posts";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.flatMap((slug) => [
    { locale: "en", slug },
    { locale: "zh", slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = await getPostBySlug(slug);
  if (!resolved) return {};
  const { meta } = resolved;
  return {
    title: meta.title,
    description: meta.description,
    // Per Phase 5.1's hreflang strategy, route alternates point at
    // our locale-prefixed paths. The `canonical` here intentionally
    // **overrides** the in-site URL with the dev.to canonical so
    // search engines treat dev.to as the source of truth.
    alternates: {
      ...buildAlternates(locale, `/blog/${slug}`),
      canonical: meta.canonical_url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical_url,
      type: "article",
      images: meta.cover_image ? [meta.cover_image] : undefined,
    },
  };
}

function adjacentEntry(article: DevtoArticleListItem | undefined) {
  if (!article) return undefined;
  return {
    href: `/blog/${article.slug}`,
    title: article.title,
    pitch: article.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = await getPostBySlug(slug);
  if (!resolved) notFound();

  // Hit the listing once more to resolve adjacent metadata for the
  // footer prev/next cards. Shares Next's data cache with
  // `getPostBySlug` — no extra upstream call.
  // dev.to lists newest-first, so `articles[idx + 1]` is the OLDER
  // (previous in archive reading order) post; `articles[idx - 1]`
  // is the NEWER (next chronologically).
  const articles = await fetchDevtoArticles(DEVTO_USERNAME);
  const idx = articles.findIndex((a) => a.slug === slug);
  const prev = adjacentEntry(
    idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : undefined,
  );
  const next = adjacentEntry(idx > 0 ? articles[idx - 1] : undefined);

  const t = await getTranslations({ locale, namespace: "Blog" });
  const { meta, full } = resolved;

  return (
    <PageShell locale={locale}>
      <article>
        <PostHeader
          title={meta.title}
          description={meta.description}
          date={meta.readable_publish_date}
          readingTime={`${meta.reading_time_minutes} min read`}
          tags={meta.tag_list}
          canonicalUrl={meta.canonical_url}
          reactionsCount={meta.positive_reactions_count}
          commentsCount={meta.comments_count}
          username={DEVTO_USERNAME}
        />

        <section className="mx-auto w-full max-w-3xl bg-muted/10 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <BlurFade delay={0.05}>
            <PostBody markdown={full.body_markdown} />
          </BlurFade>
        </section>

        {/* Cascade order matches DOM order so the reveal reads
         * top-to-bottom: body 0.05 → related 0.10 → originally 0.12
         * → footer 0.15. */}
        <BlurFade delay={0.1}>
          <RelatedPosts
            currentSlug={meta.slug}
            currentTags={meta.tag_list}
            articles={articles}
          />
        </BlurFade>

        <BlurFade delay={0.12}>
          <section className="mx-auto w-full max-w-3xl border-t px-4 py-10 sm:px-6 lg:px-8">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
              {t("originallyPublished")}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t("originallyPublishedNote")}
              </p>
              <a
                href={meta.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                <span>{t("continueOnDevto")}</span>
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.15}>
          <CaseStudyFooter prev={prev} next={next} archiveHref="/blog" />
        </BlurFade>
      </article>
    </PageShell>
  );
}
