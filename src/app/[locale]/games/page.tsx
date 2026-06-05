import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageSection } from "@/components/layout/page-section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { GameCartridge } from "@/components/games/game-cartridge";
import { getGamesSource } from "@/lib/games/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { summarize } from "@/lib/content/summary";

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
  const summary = summarize(games);
  const readyCount = summary.ready;
  const devCount = summary.total - summary.ready;

  return (
    <PageShell locale={locale}>
      {/* ───────── Arcade hero — CRT boot screen ───────── */}
      <section className="relative isolate overflow-hidden border-b bg-background">
        {/* Atmosphere stack: cyber grid → accent floor-glow → scanlines →
            bottom vignette. All token-driven so it tracks the theme. */}
        <div
          aria-hidden="true"
          className="bg-cyber-grid absolute inset-0 opacity-25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 100%, color-mix(in srgb, var(--game-accent) 16%, transparent), transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="scanline-layer pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_75%,transparent)]"
        />
        {/* Giant ghosted wordmark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-0.18em] hidden justify-center font-pixel text-[12rem] uppercase leading-none text-foreground/[0.05] md:flex lg:text-[18rem]"
        >
          {t("decorative") /* "PLAY" */}
        </span>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(15rem,19rem)] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span aria-hidden="true" className="inline-block h-3 w-0.5 bg-game-accent" />
                {t("eyebrow")}
              </p>
              <h1 className="mt-5 font-pixel text-[clamp(3.5rem,13vw,8.5rem)] uppercase leading-[0.78] tracking-[0.02em] text-foreground">
                {tNav("games")}
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block w-[0.12em] self-stretch bg-game-accent align-baseline"
                  style={{ animation: "workspace-caret 1.05s steps(1) infinite" }}
                >
                  &nbsp;
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
                {t("intro")}
              </p>
              <p className="mt-7 inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-pixel text-xl uppercase tracking-[0.08em] text-game-accent">
                <span style={{ animation: "workspace-caret 1.2s steps(1) infinite" }}>
                  ▶ {t("insertCoin")}
                </span>
                <span aria-hidden="true" className="text-border">
                  ·
                </span>
                <span className="text-muted-foreground">{t("freePlay")}</span>
              </p>
            </div>

            {/* HUD readout — stamped ink panel with the honest counts. */}
            <aside className="relative rounded-sm border border-game-accent/30 bg-[var(--surface-ink)] text-[var(--surface-paper)] sm:[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]">
              <header className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--surface-paper)_18%,transparent)] px-4 py-2">
                <span className="font-pixel text-base uppercase tracking-[0.06em]">
                  {t("archiveStatus")}
                </span>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-game-accent opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-game-accent" />
                </span>
              </header>
              <dl className="grid gap-2.5 px-4 py-4 font-mono text-[0.7rem] uppercase tracking-[0.14em]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="opacity-60">{t("credits")}</dt>
                  <dd className="text-game-accent">{t("freePlay")}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="opacity-60">{t("production")}</dt>
                  <dd className="font-pixel text-xl normal-case tracking-normal text-game-accent">
                    {String(readyCount).padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="opacity-60">{t("draft")}</dt>
                  <dd className="font-pixel text-xl normal-case tracking-normal">
                    {String(devCount).padStart(2, "0")}
                  </dd>
                </div>
              </dl>
              <p className="border-t border-[color-mix(in_srgb,var(--surface-paper)_18%,transparent)] px-4 py-2.5 text-[0.62rem] leading-relaxed opacity-55">
                {t("noClaims")}
              </p>
            </aside>
          </div>
        </div>
      </section>

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
