import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { GameCartridge } from "@/components/games/game-cartridge";
import { getGamesSource } from "@/lib/games/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

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
  const t = await getTranslations({ locale, namespace: "Game" });
  const games = await getGamesSource();

  return (
    <PageShell locale={locale}>
      {/* Arcade header — the shared PageHero (same height / size / layout
        * as every other page) juiced with the game token: an accent
        * floor-glow + CRT scanlines, the ghosted PLAY wordmark, and a
        * pixel INSERT COIN line. Same shape, louder vibe. */}
      <PageHero
        eyebrow={t("eyebrow")}
        title={tNav("games")}
        description={t("intro")}
        decorativeWord={t("decorative")}
        effects={
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 60% at 50% 100%, color-mix(in srgb, var(--game-accent) 18%, transparent), transparent 65%)",
              }}
            />
            <div
              aria-hidden="true"
              className="scanline-layer pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_75%,transparent)]"
            />
          </>
        }
        meta={
          <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-pixel text-xl uppercase tracking-[0.08em] text-game-accent">
            <span style={{ animation: "workspace-caret 1.2s steps(1) infinite" }}>
              ▶ {t("insertCoin")}
            </span>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <span className="text-muted-foreground">{t("freePlay")}</span>
          </p>
        }
      />

      {/* ───────── Cartridge shelf ───────── */}
      <PageSection>
        <Stagger
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          delay={0.05}
        >
          {games.map((game, i) => (
            <StaggerItem key={game.slug}>
              <GameCartridge game={game} locale={locale} index={i + 1} />
            </StaggerItem>
          ))}
        </Stagger>
      </PageSection>
    </PageShell>
  );
}
