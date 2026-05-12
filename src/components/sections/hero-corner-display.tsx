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
 * (line 144) but driven by `next-intl` so the wordmark localises:
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

  return (
    <div
      data-boot="corner-display"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute bottom-3 right-4 z-30 select-none sm:bottom-6 sm:right-8",
        className,
      )}
    >
      <p
        // `special-font` activates the Syne-italic `<b>` glyph swap.
        // We use `dangerouslySetInnerHTML` because the source is the
        // i18n message (which already includes the `<b>` markup for
        // the letter we want featured) — fully under our control, not
        // user input.
        className="special-font font-display text-[clamp(2.25rem,12vw,8rem)] font-black uppercase leading-[0.85] tracking-tight text-foreground/[0.06] dark:text-foreground/[0.09]"
        dangerouslySetInnerHTML={{ __html: wordmark }}
      />
    </div>
  );
}
