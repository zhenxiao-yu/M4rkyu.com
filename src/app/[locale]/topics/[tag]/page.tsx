import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { SITE_URL } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildCollectionPageJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";
import { getAllTopics, getTopic } from "@/lib/search/topics";
import type { SearchDoc } from "@/lib/search/catalog";
import { cn, FOCUS_RING } from "@/lib/utils";

// Topic hubs are built from the static content catalog (the same source as
// AI search), so they prerender and revalidate hourly alongside the rest of
// the public tier.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllTopics()).flatMap((topic) =>
    routing.locales.map((locale) => ({ locale, tag: topic.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; tag: string }>;
}): Promise<Metadata> {
  const { locale, tag } = await params;
  const topic = await getTopic(tag);
  if (!topic) return {};
  const t = await getTranslations({ locale, namespace: "Topics" });
  return {
    title: t("metaTitle", { label: topic.label }),
    description: t("metaDescription", {
      label: topic.label,
      count: topic.docs.length,
    }),
    alternates: buildAlternates(locale, `/topics/${topic.slug}`),
  };
}

const eyebrowMono =
  "font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground";

function TopicResult({
  doc,
  typeLabel,
}: {
  doc: SearchDoc;
  typeLabel: string;
}) {
  const className = cn(
    "group flex flex-col gap-1 rounded-lg border border-border bg-background/60 p-4 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
    FOCUS_RING,
  );
  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={eyebrowMono}>{typeLabel}</span>
        {doc.subtitle ? (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
            {doc.subtitle}
          </span>
        ) : null}
      </div>
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        {doc.title}
        {doc.external ? (
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
        ) : null}
      </span>
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {doc.description}
      </span>
    </>
  );

  if (doc.external) {
    return (
      <a
        href={doc.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={doc.href} className={className}>
      {inner}
    </Link>
  );
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ locale: Locale; tag: string }>;
}) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const topic = await getTopic(tag);
  if (!topic) notFound();

  const t = await getTranslations({ locale, namespace: "Topics" });

  const itemsForJsonLd = topic.docs.map((doc) => ({
    name: doc.title,
    url: doc.external ? doc.href : `${SITE_URL}/${locale}${doc.href}`,
  }));

  return (
    <PageShell locale={locale}>
      <JsonLd
        data={buildCollectionPageJsonLd(locale, {
          name: t("metaTitle", { label: topic.label }),
          description: t("metaDescription", {
            label: topic.label,
            count: topic.docs.length,
          }),
          path: `/topics/${topic.slug}`,
          items: itemsForJsonLd,
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: t("indexEyebrow"), path: "/topics" },
          { name: topic.label, path: `/topics/${topic.slug}` },
        ])}
      />
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("heading", { label: topic.label })}
        description={t("count", { count: topic.docs.length })}
        decorativeWord={topic.label}
      />
      <PageSection>
        <Link
          href="/topics"
          className={cn(
            "mb-8 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground",
            FOCUS_RING,
          )}
        >
          {t("allTopics")}
        </Link>
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
          {topic.docs.map((doc) => (
            <li key={doc.id}>
              <TopicResult doc={doc} typeLabel={t(`types.${doc.type}`)} />
            </li>
          ))}
        </ul>
      </PageSection>
    </PageShell>
  );
}
