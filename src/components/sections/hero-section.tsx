import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PixelButton } from "@/components/ui/pixel/pixel-button";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/magic/particles";
import { CommandHero } from "./command-hero";
import { GameHud } from "./game-hud";
import { HudScrollFrame } from "./hud-scroll-frame";
import { SplitHeadline } from "./split-headline";
import { HeroBootSequence } from "./hero-boot-sequence";
import { HeroClipFrame } from "./hero-clip-frame";
import { HeroPhotoStack, type HeroPhotoFrame } from "./hero-photo-stack";
import { HeroCornerDisplay } from "./hero-corner-display";
import { galleryCollections } from "@/content/gallery";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * Build the cycling photo frames for `HeroPhotoStack` from the real
 * gallery collection covers. Falls through to an empty list if none
 * have an `src` — the stack renders nothing and the rest of the hero
 * still composes correctly over the atmospheric layers.
 */
function buildHeroFrames(): HeroPhotoFrame[] {
  return galleryCollections
    .filter((c) => c.cover?.src)
    .map((c) => ({
      slug: c.slug,
      src: c.cover!.src,
      alt: c.cover!.alt,
    }));
}

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const tHud = await getTranslations({ locale, namespace: "Hud" });

  const frames = buildHeroFrames();

  return (
    <section className="relative min-h-dvh overflow-hidden border-b">
      {/* The clip-frame wraps every atmospheric + decorative layer so
        * scrolling deforms the whole substrate as one piece. Content
        * (headline, CTAs, brief, specs) sits OUTSIDE the clip frame
        * so it stays crisp and readable as the frame morphs under
        * scroll — port of the layered z-index pattern from
        * adrianhajdin/award-winning-website's Hero/About sections.
        *
        * Audit pass:
        *   - Photo wrapper no longer carries `-z-10` (was creating a
        *     stacking context that trapped the preview tile behind
        *     content). Photo image owns its own `-z-10`; the preview
        *     tile resolves at `z-30` in the section context.
        *   - Dropped the redundant `bg-background/55` scrim — the
        *     photo opacity bump (0.32 → 0.55) does the dimming.
        *   - Dropped AnimatedGridPattern — Particles carries the
        *     atmospheric trail alone for a less cyber-noisy read.
        *   - Corner watermark moved BEFORE content in DOM so it
        *     paints behind without z-index gymnastics. */}
      <HeroClipFrame>
        <div className="absolute inset-0">
          <HeroPhotoStack frames={frames} />
        </div>
        <Particles
          className="-z-10 hidden sm:block"
          quantity={24}
          speed={0.06}
          size={1.2}
          maxOpacity={0.4}
          color="var(--ring)"
        />
        <div
          aria-hidden="true"
          className="noise-layer absolute inset-0 -z-10"
        />
        <div
          aria-hidden="true"
          className="scanline-layer absolute inset-0 -z-10 opacity-20"
        />
        <div
          aria-hidden="true"
          className="hero-vignette absolute inset-0 -z-10"
        />
        <HeroCornerDisplay locale={locale} />

        <HeroBootSequence>
          <div className="relative mx-auto grid w-full max-w-7xl items-start gap-10 px-4 pt-20 pb-12 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-16 lg:pt-28 lg:pb-16 lg:px-8">
            {/* Left column — eyebrow, headline, subtitle, two CTAs. */}
            <div className="flex flex-col gap-7">
              <span
                data-boot="eyebrow"
                className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
              >
                {t("eyebrow")}
              </span>
              <h1
                data-boot="headline"
                className="font-display text-balance text-[3rem] font-extrabold leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl"
              >
                {/* Text-splitting is EN-only by doctrine — see PR #60.
                 * /zh renders the headline as plain text. */}
                {locale === "en" ? (
                  <SplitHeadline text={t("title")} />
                ) : (
                  t("title")
                )}
              </h1>
              <p
                data-boot="subtitle"
                className="max-w-xl text-lg leading-8 text-muted-foreground"
              >
                {t("subtitle")}
              </p>
              <div
                data-boot="ctas"
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <PixelButton
                  glyph="caret"
                  sound="confirm"
                  size="lg"
                  href="/work"
                >
                  {t("heroCtaBrowse")}
                </PixelButton>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/logs" locale={locale}>
                    {t("heroCtaLogs")}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right column — refreshed CommandHero (BentoTilt +
              * CursorRadial + BorderBeam now layered inside).
              * Single-column on tablet/mobile per the existing pattern. */}
            <div data-boot="panel">
              <CommandHero locale={locale} />
            </div>
          </div>

          {/* Footer HUD strip — scroll-tied opacity ramp per PR #60.
            * Specs strip was moved out of the hero (was duplicating
            * the brief card's info); it now lives as its own
            * "signals" band on the home page right below this hero. */}
          <div
            data-boot="hud"
            className="relative mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"
          >
            <HudScrollFrame>
              <GameHud
                hint={t("heroCmdkHint")}
                ariaLabel={tHud("systemStatus")}
              />
            </HudScrollFrame>
          </div>
        </HeroBootSequence>
      </HeroClipFrame>
    </section>
  );
}
