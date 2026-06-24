import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";
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

  return (
    <PageShell locale={locale}>
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto w-full max-w-page px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,44rem)_1fr] lg:items-end lg:gap-16">
            <div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("description")}
              </p>
            </div>
            <div className="border-l border-border/70 pl-4 text-sm leading-6 text-muted-foreground">
              <p>
                <span className="font-mono text-foreground">
                  {posts.length}
                </span>{" "}
                {t("postsPublished")}
              </p>
              <p className="mt-1">
                {t("syndicatedFrom")}{" "}
                <a
                  href={`https://dev.to/${DEVTO_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-ring",
                    FOCUS_RING,
                  )}
                >
                  dev.to / @{DEVTO_USERNAME}
                </a>
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-background">
        <div className="mx-auto w-full max-w-page px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <BlogTimeline posts={posts} />
        </div>
      </main>
    </PageShell>
  );
}
