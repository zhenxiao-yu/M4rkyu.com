import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface HeroCornerDisplayProps {
  locale: Locale;
  className?: string;
}

/**
 * Massive corner display heading rendered as a watermark behind the
 * primary content. Port of the absolute-positioned `G<b>A</b>MING`
 * heading from adrianhajdin/award-winning-website's `Hero.jsx`
 * (line 144) but driven by `next-intl` so the wordmark localises.
 *
 * Audit pass:
 *   - Opacity bumped from 6% → 14% (light) / 18% (dark) so the
 *     watermark reads instead of looking like a glitch.
 *   - DOM order moved BEFORE the content grid in `hero-section.tsx`;
 *     z-index removed entirely so the content naturally paints over
 *     it without the watermark eclipsing the mission brief card.
 *   - Locale-aware size: ZH's 3-char wordmark would render absurdly
 *     large at the EN clamp; ZH gets a tighter clamp so the corner
 *     scale matches visually.
 *
 *   - EN: `OPERAT<b>O</b>R` — one letter in Syne italic via
 *     `.special-font b` (see `src/app/globals.css`).
 *   - ZH: `操作员` (no italic accent — CJK doesn't carry stylistic
 *     alternates the way Latin does; the swap degrades to plain
 *     weight, which is the intended fallback).
 *
 * Decorative — `aria-hidden` so screen readers don't double-read the
 * brand. The page already announces the real heading via the
 * `<h1>` in `hero-section.tsx`.
 *
 * Pointer-events-none so it never blocks the photo-stack tile click
 * region underneath.
 */
export async function HeroCornerDisplay({ locale, className }: HeroCornerDisplayProps) {
  const t = await getTranslations({ locale, namespace: "Home.hero" });
  const wordmark = t.raw("cornerDisplay") as string;

  // CJK glyphs read as visually wider per character; matching the
  // EN clamp would create a wordmark twice as visually heavy. Drop
  // the clamp by ~40% so the corner scale stays balanced across
  // locales.
  const sizeClass =
    locale === "zh"
      ? "text-[clamp(1.5rem,7vw,4.5rem)]"
      : "text-[clamp(2.25rem,12vw,8rem)]";

  return (
    <div
      data-boot="corner-display"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute bottom-4 right-5 select-none sm:bottom-10 sm:right-10",
        className,
      )}
    >
      <p
        // `special-font` activates the Syne-italic `<b>` glyph swap.
        // We use `dangerouslySetInnerHTML` because the source is the
        // i18n message (which already includes the `<b>` markup for
        // the letter we want featured) — fully under our control, not
        // user input.
        className={cn(
          "special-font font-display font-black uppercase leading-[0.85] tracking-tight text-foreground/14 dark:text-foreground/18",
          sizeClass,
        )}
        dangerouslySetInnerHTML={{ __html: wordmark }}
      />
    </div>
  );
}
