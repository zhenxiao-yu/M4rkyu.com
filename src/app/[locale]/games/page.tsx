import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArchiveCard } from "@/components/cards/archive-card";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { getGamesSource } from "@/lib/games/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { localize } from "@/lib/content/localize";
import { summarize } from "@/lib/content/summary";

// Public content via the cookieless read source → statically rendered,
// revalidated hourly (admin edits also bust the cache via revalidatePath).
// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const tGame = await getTranslations({ locale, namespace: "Game" });
  return {
    title: tNav("games"),
    description: tGame("metaDescription"),
    alternates: buildAlternates(locale, "/games"),
  };
}

export default async function GamesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const tGame = await getTranslations({ locale, namespace: "Game" });
  const games = await getGamesSource();
  const summary = summarize(games);
  const readyCount = summary.ready;
  const draftCount = summary.total - summary.ready;

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tGame("eyebrow")}
        title={tNav("games")}
        description={tGame("intro")}
        decorativeWord="PLAY"
      >
        <Card className="bg-background/70 shadow-lg shadow-black/5 backdrop-blur-xl hover:border-ring/50 dark:shadow-black/20">
          <CardHeader>
            <CardTitle>{tGame("archiveStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-mono text-foreground">{readyCount}</span>{" "}
              {tGame("production")}
            </p>
            <p>
              <span className="font-mono text-foreground">{draftCount}</span>{" "}
              {tGame("draft")}
            </p>
            <p>{tGame("noClaims")}</p>
          </CardContent>
        </Card>
      </PageHero>

      <PageSection>
        <Stagger
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          delay={0.05}
        >
          {games.map((game) => {
            const localized = localize(game, locale);
            return (
              <StaggerItem key={game.slug}>
                <ArchiveCard
                  title={localized.title}
                  description={localized.pitch as string}
                  eyebrow={game.engine}
                  status={game.status}
                  href={`/games/${game.slug}`}
                  locale={locale}
                  mediaLabel={tGame("coverTbd")}
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </PageSection>
    </PageShell>
  );
}
