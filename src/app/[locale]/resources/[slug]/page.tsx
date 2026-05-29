import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolShell } from "@/components/tools/tool-shell";
import { isToolSlug } from "@/components/tools/tool-registry";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { CopyCitationButton } from "@/components/system/copy-citation-button";
import { resources } from "@/content/resources";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildToolJsonLd } from "@/lib/seo/structured-data";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath; new DB-only slugs render on demand).
export const dynamic = "force-static";
export const revalidate = 3600;

interface ToolPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

function resolveResource(slug: string) {
  return resources.find((r) => r.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return resources
    .filter((r) => r.type === "tool")
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resource = resolveResource(slug);
  if (!resource) return {};
  return {
    title: resource.name,
    description: resource.description,
    alternates: buildAlternates(locale, `/resources/${slug}`),
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const resource = resolveResource(slug);

  // Unknown slug → 404. External-link entries → redirect to source URL
  // so saved bookmarks of /resources/[slug] don't dead-end.
  if (!resource) notFound();
  if (resource.type !== "tool") redirect(resource.link);
  if (!isToolSlug(slug)) notFound();

  const t = await getTranslations({ locale, namespace: "Resources" });
  const citation = `${resource.name} — M4rkyu.com. ${resource.link}`;

  return (
    <PageShell locale={locale}>
      <JsonLd data={buildToolJsonLd(resource, locale)} />
      <PageSection>
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-3 h-auto px-3 text-muted-foreground hover:text-foreground"
          >
            <Link href="/resources" locale={locale}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("backToResources")}
            </Link>
          </Button>
        </div>
        <ToolShell
          title={resource.name}
          description={resource.description}
          category={resource.category}
          tags={resource.tags}
          actions={
            <>
              <Button asChild variant="outline" size="sm">
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("toolSource")}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </Button>
              <CopyCitationButton citation={citation} />
            </>
          }
        >
          <ToolRenderer slug={slug} />
        </ToolShell>
      </PageSection>
    </PageShell>
  );
}
