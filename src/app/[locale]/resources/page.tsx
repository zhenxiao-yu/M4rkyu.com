import type { Metadata } from "next";
import { ArrowUpRight, Layers, Link2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { ToolIcon } from "@/components/resources/tool-icon";
import { getResourcesSource } from "@/lib/resources/source";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildToolsCollectionJsonLd } from "@/lib/seo/structured-data";
import { cn, FOCUS_RING } from "@/lib/utils";

const PREVIEW_COUNT = 4;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("resourcesTitle"),
    description: tMeta("resourcesDescription"),
    alternates: buildAlternates(locale, "/resources"),
  };
}

export default async function ResourcesLandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Resources" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  const resources = await getResourcesSource();
  const tools = resources.filter(
    (resource) => resource.type === "tool" && resource.status === "ready",
  );
  const links = resources.filter(
    (resource) => resource.type === "link" && resource.status === "ready",
  );

  // Preview pool — prefer featured items, then fall back to the head
  // of the list so the tiles always have something to render.
  const toolPreviews = pickPreviews(tools, PREVIEW_COUNT);
  const linkPreviews = pickPreviews(links, PREVIEW_COUNT);

  return (
    <PageShell locale={locale}>
      <JsonLd data={buildToolsCollectionJsonLd(locale, tools)} />
      <PageHero
        eyebrow={t("landingEyebrow")}
        title={tMeta("resourcesTitle")}
        description={t("landingLede")}
        decorativeWord="RESOURCES"
      />

      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-4 lg:grid-cols-2">
          <EntryTile
            href="/resources/tools"
            locale={locale}
            eyebrow={t("ToolsPage.eyebrow")}
            title={t("landingToolsTitle")}
            lede={t("landingToolsLede")}
            count={t("landingToolsCount", { count: tools.length })}
            previewLabel={t("landingPreviewToolsLabel")}
            enterLabel={t("landingEnter")}
            previews={toolPreviews.map((tool) => ({
              key: tool.slug,
              name: tool.name,
              iconKey: tool.iconKey,
              tags: tool.tags,
            }))}
            icon={<Layers aria-hidden="true" className="size-6" />}
          />
          <EntryTile
            href="/resources/links"
            locale={locale}
            eyebrow={t("LinksPage.eyebrow")}
            title={t("landingLinksTitle")}
            lede={t("landingLinksLede")}
            count={t("landingLinksCount", { count: links.length })}
            previewLabel={t("landingPreviewLinksLabel")}
            enterLabel={t("landingEnter")}
            previews={linkPreviews.map((link) => ({
              key: link.slug,
              name: link.name,
              iconKey: link.iconKey,
              tags: link.tags,
            }))}
            icon={<Link2 aria-hidden="true" className="size-6" />}
          />
        </div>
      </PageSection>
    </PageShell>
  );
}

function pickPreviews<T extends { featured: boolean }>(items: T[], n: number) {
  const featured = items.filter((i) => i.featured);
  if (featured.length >= n) return featured.slice(0, n);
  const rest = items.filter((i) => !i.featured);
  return [...featured, ...rest].slice(0, n);
}

interface EntryTileProps {
  href: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  lede: string;
  count: string;
  previewLabel: string;
  enterLabel: string;
  previews: { key: string; name: string; iconKey?: string; tags: string[] }[];
  icon: React.ReactNode;
}

function EntryTile({
  href,
  locale,
  eyebrow,
  title,
  lede,
  count,
  previewLabel,
  enterLabel,
  previews,
  icon,
}: EntryTileProps) {
  return (
    <Link
      href={href}
      locale={locale}
      aria-label={title}
      className={cn(
        "group relative isolate flex h-full min-h-80 flex-col gap-5 overflow-hidden rounded-lg border border-border bg-card/80 p-6 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium) sm:p-8",
        "hover:border-ring/70 motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
      )}
    >
      <PointerSpotlight radius={520} intensity={0.22} />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cyber-grid opacity-25"
      />
      <div className="relative z-20 flex items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-md border border-ring/40 bg-background/60 text-ring">
          {icon}
        </span>
        <Badge
          variant="outline"
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
        >
          {count}
        </Badge>
      </div>
      <div className="relative z-20 grid gap-2">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-prose text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {lede}
        </p>
      </div>

      {previews.length > 0 ? (
        <div className="relative z-20 mt-auto grid gap-2">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground/80">
            {previewLabel}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {previews.map((preview) => (
              <li
                key={preview.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground"
              >
                <ToolIcon
                  iconKey={preview.iconKey}
                  tags={preview.tags}
                  className="size-3.5"
                />
                <span className="whitespace-nowrap">{preview.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="relative z-20 flex items-center gap-2 text-sm text-foreground">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          {enterLabel}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
        />
      </div>
    </Link>
  );
}
