import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { getShopProducts } from "@/content/shop";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/blog/get-posts";
import { firstLine } from "@/lib/feed/items";
import { buildAlternates } from "@/lib/seo/alternates";
import { getNotesSource } from "@/lib/notes/source";
import { getProjectsSource } from "@/lib/projects/source";
import { getGallerySource } from "@/lib/gallery/source";
import { getResourcesSource } from "@/lib/resources/source";
import { cn, FOCUS_RING } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = 3600;

type LatestKind = "note" | "log" | "work" | "frame" | "resource" | "shop";

interface LatestItem {
  id: string;
  kind: LatestKind;
  title: string;
  description: string;
  href: string;
  date?: string;
  tags: string[];
}

const DATE_LOCALE: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
};

// Single-accent language: kinds vary by accent/neutral intensity, not hue.
// The translated label is the primary differentiator; tone is a quiet cue.
const KIND_TONE: Record<LatestKind, string> = {
  note: "border-ring/50 bg-ring/12 text-foreground",
  log: "border-ring/30 bg-ring/6 text-foreground",
  work: "border-foreground/25 bg-foreground/8 text-foreground",
  frame: "border-foreground/15 bg-foreground/4 text-muted-foreground",
  resource: "border-border bg-muted/50 text-muted-foreground",
  shop: "border-border bg-muted/30 text-muted-foreground",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("latestTitle"),
    description: tMeta("latestDescription"),
    alternates: buildAlternates(locale, "/latest"),
  };
}

function displayDate(value: string | undefined, locale: Locale): string {
  if (!value) return "";
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function sortValue(item: LatestItem): number {
  if (!item.date) return 0;
  if (/^\d{4}$/.test(item.date)) return Date.parse(`${item.date}-01-01`);
  const parsed = Date.parse(item.date);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function LatestPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Latest" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  const [notes, posts, projects, gallerySource, resourceItems] =
    await Promise.all([
      getNotesSource(),
      getPosts(),
      getProjectsSource(),
      getGallerySource(),
      getResourcesSource(),
    ]);

  const items: LatestItem[] = [
    ...notes.map((note) => ({
      id: `note:${note.slug}`,
      kind: "note" as const,
      title: note.title || firstLine(note.body),
      description: firstLine(note.body),
      href: `/notes#${note.slug}`,
      date: note.publishedAt,
      tags: note.tags,
    })),
    ...posts
      .filter((post) => post.status === "ready")
      .slice(0, 12)
      .map((post) => ({
        id: `log:${post.slug}`,
        kind: "log" as const,
        title: post.title,
        description: post.excerpt,
        href: `/logs/${post.slug}`,
        date: post.publishedAt ?? post.date,
        tags: post.tags,
      })),
    ...projects
      .filter((project) => project.contentStatus === "ready")
      .map((project) => ({
        id: `work:${project.slug}`,
        kind: "work" as const,
        title: project.title,
        description: project.shortPitch,
        href: `/work/${project.slug}`,
        date: project.year,
        tags:
          project.tags.length > 0 ? project.tags : project.stack.slice(0, 3),
      })),
    ...gallerySource.items
      .filter((item) => item.status === "ready")
      .slice(0, 8)
      .map((item) => ({
        id: `frame:${item.slug}`,
        kind: "frame" as const,
        title: item.title,
        description: item.caption,
        href: `/archive?frame=${item.slug}`,
        date: item.capturedAt,
        tags: item.tags,
      })),
    ...resourceItems
      .filter((resource) => resource.status === "ready" && resource.featured)
      .slice(0, 8)
      .map((resource) => ({
        id: `resource:${resource.slug}`,
        kind: "resource" as const,
        title: resource.name,
        description: resource.why,
        href: `/resources/${resource.slug}`,
        tags: resource.tags,
      })),
    ...getShopProducts()
      .filter((product) => product.featured)
      .map((product) => ({
        id: `shop:${product.slug}`,
        kind: "shop" as const,
        title: product.title,
        description: product.summary,
        href: `/shop/${product.slug}`,
        tags: product.tags,
      })),
  ]
    .sort((a, b) => sortValue(b) - sortValue(a))
    .slice(0, 36);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("latestTitle")}
        description={tMeta("latestDescription")}
        decorativeWord="LATEST"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-2.5">
          {items.map((item, index) => (
            <BlurFade key={item.id} delay={Math.min(index, 6) * 0.05}>
              <Link
                href={item.href}
                locale={locale}
                className={cn(
                  "glass-surface glass-interactive group grid items-start gap-4 rounded-lg p-4 sm:grid-cols-[2.5rem_8rem_1fr_auto] sm:gap-5 sm:p-5",
                  FOCUS_RING,
                )}
              >
                <span
                  aria-hidden="true"
                  className="hidden font-mono text-sm tabular-nums text-muted-foreground/45 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring sm:block sm:pt-0.5"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:block">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[0.58rem] uppercase tracking-[0.18em]",
                      KIND_TONE[item.kind],
                    )}
                  >
                    {t(`kind.${item.kind}`)}
                  </Badge>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground sm:mt-3">
                    {item.date ? displayDate(item.date, locale) : t("featured")}
                  </p>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  {item.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[0.62rem] lowercase text-muted-foreground/75"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="hidden size-4 text-muted-foreground transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring sm:block motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </Link>
            </BlurFade>
          ))}
        </div>
      </PageSection>
    </PageShell>
  );
}
