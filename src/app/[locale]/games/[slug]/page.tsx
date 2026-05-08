import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { GameDetailHeader } from "@/components/case-study/game-detail-header";
import {
  CaseStudyList,
  CaseStudySection,
} from "@/components/case-study/case-study-section";
import { PullQuoteBlock } from "@/components/case-study/pull-quote-block";
import { CaseStudyFooter } from "@/components/case-study/case-study-footer";
import { games } from "@/content/games";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return games.flatMap((game) => [
    { locale: "en", slug: game.slug },
    { locale: "zh", slug: game.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.pitch,
    alternates: { canonical: `/${locale}/games/${slug}` },
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();

  const tGame = await getTranslations({ locale, namespace: "Game" });
  const tCase = await getTranslations({ locale, namespace: "CaseStudy" });

  // Adjacent navigation in archive order — predictable, no clever sort.
  const gameIndex = games.findIndex((g) => g.slug === game.slug);
  const prevGame = gameIndex > 0 ? games[gameIndex - 1] : undefined;
  const nextGame =
    gameIndex < games.length - 1 ? games[gameIndex + 1] : undefined;
  const prev = prevGame
    ? {
        href: `/games/${prevGame.slug}`,
        title: prevGame.title,
        pitch: prevGame.pitch,
      }
    : undefined;
  const next = nextGame
    ? {
        href: `/games/${nextGame.slug}`,
        title: nextGame.title,
        pitch: nextGame.pitch,
      }
    : undefined;

  return (
    <PageShell locale={locale}>
      <article>
        <GameDetailHeader game={game} />

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <BlurFade>
            <figure className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted">
              {game.cover ? (
                <Image
                  src={game.cover.src}
                  alt={game.cover.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 1100px, 100vw"
                  className="object-cover"
                />
              ) : (
                <PlaceholderImage
                  label={tGame("coverTbd")}
                  aspect="h-full"
                  className="rounded-none border-0"
                />
              )}
            </figure>
          </BlurFade>
        </section>

        {game.pillars.length > 0 ? (
          <section className="border-y bg-muted/20">
            <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <BlurFade>
                <CaseStudySection
                  eyebrow={tGame("pillarsEyebrow")}
                  title={tGame("pillarsTitle")}
                >
                  <CaseStudyList items={game.pillars} numbered />
                </CaseStudySection>
              </BlurFade>
            </div>
          </section>
        ) : null}

        {game.outcome ? (
          <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <BlurFade>
              <PullQuoteBlock
                eyebrow={tCase("outcomeEyebrow")}
                quote={game.outcome}
              />
            </BlurFade>
          </section>
        ) : null}

        {game.postmortem ? (
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <BlurFade>
              <CaseStudySection
                eyebrow={tGame("postmortemEyebrow")}
                title={tGame("postmortemTitle")}
              >
                <p>{game.postmortem}</p>
              </CaseStudySection>
            </BlurFade>
          </section>
        ) : null}

        {game.notes.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <BlurFade>
              <CaseStudySection
                eyebrow={tGame("notesEyebrow")}
                title={tGame("notesTitle")}
              >
                <CaseStudyList items={game.notes} />
              </CaseStudySection>
            </BlurFade>
          </section>
        ) : null}

        <CaseStudyFooter prev={prev} next={next} archiveHref="/games" />
      </article>
    </PageShell>
  );
}
