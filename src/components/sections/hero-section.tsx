import { getTranslations } from "next-intl/server";
import { Waves } from "@/components/ui/magic/waves";
import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { Shuffle } from "@/components/ui/magic/shuffle";
import { HeroBootSequence } from "./hero-boot-sequence";
import { HeroScrollCue } from "./hero-scroll-cue";
import type { Locale } from "@/i18n/routing";

/**
 * Hero — a calm, mostly-empty stage. A cursor-reactive Perlin wave
 * field (theme-aware, reduced-motion-safe, self-pausing off-screen)
 * fills the screen; the bold "Compile ✦ Compose" wordmark sits pinned
 * to the floor, framed top and bottom by a thin binary-feed marquee.
 *
 * The restraint is the point — no index nav, keyword cloud, discipline
 * ledger, or preview reel. One screen tall (`min-h-dvh`), tagged
 * `data-home-section` so PageDown / the scroll cue page to the next
 * section. The on-load reveal + reduced-motion are owned by
 * HeroBootSequence.
 */
const BINARY_FEED =
  "01001101 00110100 01010010 01001011 01011001 01010101 // 0xFF3E // COMPILE // 11000100 01001011 // 01011001 0xCAFE // COMPOSE // 0xDEAD 10101010 // 01010011 01011001 01010011 01000011 // 0xA4B7";

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });

  // Split the title at "+" so the StarGlyph can sit between the two
  // words while each side still flows through its Shuffle reveal.
  const title = t("title");
  const [titleA, titleB] = title.includes("+")
    ? title.split("+").map((s) => s.trim())
    : [title, ""];
  const spokenTitle = title.replace("+", " ").replace(/\s+/g, " ").trim();

  return (
    <section
      data-home-section="stage"
      className="relative isolate min-h-dvh overflow-hidden border-b border-border/60 bg-background"
    >
      {/* Interactive wave field — cursor-reactive, kept sparse + faint so
        * the stage reads as mostly empty. A floor-ward fade settles the
        * field onto calm ground for the wordmark; grain de-digitises it. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Waves
          className="opacity-[0.55] dark:opacity-[0.5]"
          xGap={30}
          yGap={38}
          waveAmpX={20}
          waveAmpY={11}
          touchImpulse
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent_44%,color-mix(in_srgb,var(--background)_72%,transparent))]" />
        <div className="noise-layer pointer-events-none absolute inset-0 opacity-40" />
      </div>

      <HeroBootSequence>
        {/* Subtle masthead — one quiet line, not a nav. */}
        <div
          data-hero-intro
          className="absolute inset-x-4 top-[calc(var(--dock-h)+1.1rem)] z-10 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/45 sm:inset-x-6"
        >
          <span>M4RKYU.SYS</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-ring shadow-[0_0_8px_var(--ring)]" />
            Ontario
          </span>
        </div>

        {/* Bottom band — marquee · wordmark · marquee, pinned to the
          * floor over a solid base so the headline stays crisp. */}
        <div
          data-hero-intro
          className="absolute inset-x-0 bottom-0 z-10 bg-background"
        >
          <HeroScrollCue className="absolute bottom-[calc(100%+1rem)] left-1/2 z-20 -translate-x-1/2" />

          <BinaryMarquee feed={BINARY_FEED} />

          <div className="flex w-full justify-center sm:overflow-hidden">
            <h1
              aria-label={spokenTitle}
              className="font-wordmark w-full px-3 pb-4 pt-4 text-center text-[clamp(2.25rem,8.6vw,12rem)] font-black uppercase leading-[0.84] tracking-[-0.04em] text-foreground sm:w-auto sm:shrink-0 sm:whitespace-nowrap sm:pb-5 sm:pt-5"
            >
              {/* Mobile: plain wrap with the star. Desktop: Shuffle reels on
                * one line. The star is tinted to the active accent ink. */}
              <span
                aria-hidden="true"
                className="flex flex-col items-center gap-1.5 sm:hidden"
              >
                <span>
                  {locale === "en" ? <HeadlineShuffle text={titleA} /> : titleA}
                </span>
                <StarGlyph className="size-[0.5em] text-ring drop-shadow-[0_0_12px_color-mix(in_srgb,var(--ring)_45%,transparent)]" />
                <span>
                  {locale === "en" ? <HeadlineShuffle text={titleB} /> : titleB}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="hidden sm:inline-flex sm:items-baseline sm:gap-[0.18em]"
              >
                {locale === "en" ? <HeadlineShuffle text={titleA} /> : titleA}
                <StarGlyph className="inline-block size-[0.5em] shrink-0 self-center text-ring drop-shadow-[0_0_12px_color-mix(in_srgb,var(--ring)_45%,transparent)]" />
                {locale === "en" ? <HeadlineShuffle text={titleB} /> : titleB}
              </span>
            </h1>
          </div>

          <BinaryMarquee feed={BINARY_FEED} reverse />
        </div>
      </HeroBootSequence>
    </section>
  );
}

/**
 * Headline word — a single ambient scramble. Resolves on mount and on
 * hover; no auto-loop, so the eye lands on the word, not the motion.
 */
function HeadlineShuffle({ text }: { text: string }) {
  return (
    <Shuffle
      text={text}
      duration={0.45}
      density={0.22}
      triggerOnHover
      shuffleDirection="up"
    />
  );
}

/**
 * Thin binary-feed marquee used as the bookends around the wordmark.
 * Four identical segments + the `marquee` keyframe (translate -50%) give
 * a seamless loop; edges fade via a mask. Decorative + reduced-motion
 * static (the animation is `motion-safe` only).
 */
function BinaryMarquee({
  feed,
  reverse = false,
}: {
  feed: string;
  reverse?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-border/60 py-1.5"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-12 whitespace-nowrap font-mono text-[0.55rem] uppercase tracking-[0.3em] text-foreground/40 motion-safe:animate-[marquee_42s_linear_infinite]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>{feed}</span>
        ))}
      </div>
    </div>
  );
}
