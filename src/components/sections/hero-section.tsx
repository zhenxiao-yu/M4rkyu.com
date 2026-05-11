import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { PixelButton } from "@/components/ui/pixel/pixel-button";
import { Button } from "@/components/ui/button";
import { CommandHero } from "./command-hero";
import { GameHud } from "./game-hud";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const tHud = await getTranslations({ locale, namespace: "Hud" });

  return (
    <section className="relative overflow-hidden border-b">
      {/* Atmospheric layers — `noise` + `scanline` carry the 20% cyber
        * slice from docs/UNIFIED_VISUAL_DIRECTION.md §2; cyber-grid is
        * scoped to CommandHero so the homepage stays editorial-first. */}
      <div className="noise-layer absolute inset-0" aria-hidden="true" />
      <div
        className="scanline-layer absolute inset-0 opacity-25"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-start gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-16 lg:py-28 lg:px-8">
        {/* Left column — eyebrow, headline, subtitle, two CTAs. */}
        <BlurFade className="flex flex-col gap-7">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("eyebrow")}
          </span>
          <h1 className="font-display text-balance text-[3rem] font-extrabold leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PixelButton
              glyph="caret"
              sound="confirm"
              size="lg"
              href="/projects"
            >
              {t("heroCtaBrowse")}
            </PixelButton>
            <Button variant="outline" size="lg" asChild>
              <Link href="/blog" locale={locale}>
                {t("heroCtaLogs")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </BlurFade>

        {/* Right column — atmospheric command card. Visible at every
          * viewport per docs/UNIFIED_VISUAL_DIRECTION.md §9.1; the grid
          * is single-column below `lg`, so it stacks under the headline
          * on tablet and mobile rather than disappearing. */}
        <CommandHero />
      </div>

      {/* Footer HUD strip */}
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <GameHud
          hint={t("heroCmdkHint")}
          ariaLabel={tHud("systemStatus")}
        />
      </div>
    </section>
  );
}
