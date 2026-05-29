import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { PostBody } from "@/components/blog/post-body";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

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
    title: tMeta("changelogTitle"),
    description: tMeta("changelogDescription"),
    alternates: buildAlternates(locale, "/changelog"),
  };
}

async function readChangelog(): Promise<string | null> {
  try {
    return await readFile(join(process.cwd(), "CHANGELOG.md"), "utf8");
  } catch {
    return null;
  }
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Changelog" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const markdown = await readChangelog();

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("changelogTitle")}
        description={tMeta("changelogDescription")}
        decorativeWord="CHANGE"
      />
      <PageSection width="narrow" innerClassName="py-10 sm:py-12 lg:py-14">
        <BlurFade>
          <div className="mb-5 flex items-center gap-3">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full rounded-full bg-ring/60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-ring" />
            </span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("eyebrow")}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          {markdown ? (
            <PostBody
              markdown={markdown}
              className="glass-surface max-w-none rounded-lg p-5 sm:p-7 [&>*:first-child]:mt-0!"
            />
          ) : (
            <p className="glass-surface rounded-lg p-5 text-sm text-muted-foreground sm:p-7">
              {t("empty")}
            </p>
          )}
        </BlurFade>
      </PageSection>
    </PageShell>
  );
}
