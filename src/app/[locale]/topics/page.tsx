import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBlogJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";
import { getAllTopics } from "@/lib/search/topics";
import { cn, FOCUS_RING } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("topicsTitle"),
    description: tMeta("topicsDescription"),
    alternates: buildAlternates(locale, "/topics"),
  };
}

export default async function TopicsIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Topics" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const topics = getAllTopics();

  return (
    <PageShell locale={locale}>
      <JsonLd
        data={buildBlogJsonLd(locale, {
          name: tMeta("topicsTitle"),
          description: tMeta("topicsDescription"),
          path: "/topics",
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "/" },
          { name: t("indexEyebrow"), path: "/topics" },
        ])}
      />
      <PageHero
        eyebrow={t("indexEyebrow")}
        title={t("indexTitle")}
        description={t("indexDescription")}
        decorativeWord="TOPICS"
      />
      <PageSection>
        {topics.length === 0 ? (
          <EmptyArchiveState description={t("empty")} />
        ) : (
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
                    FOCUS_RING,
                  )}
                >
                  <span className="text-foreground">{topic.label}</span>
                  <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
                    {topic.docs.length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </PageShell>
  );
}
