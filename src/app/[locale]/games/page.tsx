import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArchiveCard } from "@/components/cards/archive-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { games } from "@/content/games";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { localize } from "@/lib/content/localize";

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
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const tGame = await getTranslations({ locale, namespace: "Game" });
  const readyCount = games.filter((g) => g.status === "ready").length;
  const draftCount = games.length - readyCount;

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow={tGame("eyebrow")}
              title={tNav("games")}
              description={tGame("intro")}
            />
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <Card className="bg-background/70 backdrop-blur">
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
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" delay={0.05}>
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
      </section>
    </PageShell>
  );
}
