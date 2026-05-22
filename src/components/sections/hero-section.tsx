import { getTranslations } from "next-intl/server";
import { Galaxy } from "@/components/ui/magic/galaxy";
import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { Shuffle } from "@/components/ui/magic/shuffle";
import { HeroBootSequence } from "./hero-boot-sequence";
import type { Locale } from "@/i18n/routing";

/**
 * Hero — wodniack-patterned "Creative ✦ Developer." stage.
 *
 *   - Galaxy fills the upper field (both themes; light inverts via
 *     CSS filter so stars become dark specks on cream).
 *   - Top-left: 4-line mono status panel.
 *   - Top-right (sm+): short tag + email-me link.
 *   - Bottom band (pinned to viewport floor):
 *       1. Binary-feed marquee (top edge)
 *       2. Solid theme-bg block with huge headline
 *          "Creative ✦ Developer." — `+` from the i18n string is
 *          replaced with the StarGlyph SVG. Solid bg means the
 *          galaxy doesn't bleed through under the headline (per
 *          user feedback "background behind text should be solid").
 *       3. Binary-feed marquee (bottom edge)
 *
 * `.hero-vignette` was retired — its radial gradient produced a
 * visible white blob on too many viewports.
 */
export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  // Binary feed — system-telemetry caps text. Used for both the
  // top and bottom marquee strips around the headline.
  const BINARY_FEED =
    "01001101 00110100 01010010 01001011 01011001 01010101 // 0xFF3E // 11000100 01001011 // 01011001 0xCAFE // 0xDEAD 10101010 // 01010011 01011001 01010011 01000011 // 0xA4B7 // 01101111 01110000 01100101 01110010 01100001 01110100 01101001 01101110 01100111";

  // Split title at "+" so we can drop the StarGlyph in between while
  // each side still flows through SplitHeadline's char-stagger reveal
  // (EN only). Falls back to plain rendering when no "+" present.
  const title = t("title");
  const [titleA, titleB] = title.includes("+")
    ? title.split("+").map((s) => s.trim())
    : [title, ""];
  const spokenTitle = title.replace("+", " ").replace(/\s+/g, " ").trim();

  return (
    <section
      data-snap="section"
      className="relative isolate flex min-h-dvh flex-col overflow-hidden border-b"
    >
      {/* Galaxy backdrop — both themes, dark-mode native, light-mode
        * inverts so stars become dark specks on cream. */}
      <div className="absolute inset-0 -z-20 invert dark:invert-0">
        <Galaxy
          density={0.5}
          hueShift={105}
          speed={0.6}
          glowIntensity={0.2}
          saturation={0.15}
          twinkleIntensity={0.1}
          starSpeed={0.4}
          rotationSpeed={0.05}
          mouseInteraction
          mouseRepulsion={false}
          transparent
        />
      </div>

      <HeroBootSequence>
        {/* Bottom band — marquee, solid-bg headline, marquee */}
        <div
          data-boot="hud"
          className="absolute inset-x-0 bottom-0 z-10 bg-background"
        >
          {/* Top marquee (above headline) */}
          <BinaryMarquee feed={BINARY_FEED} />

          {/* Headline on solid theme background */}
          <div className="flex w-full justify-center sm:overflow-hidden">
            <h1
              data-boot="headline"
              aria-label={spokenTitle}
              className="font-display w-full px-2 pt-4 pb-3 text-center text-[clamp(2.25rem,6.25vw,7.5rem)] font-black leading-[0.9] tracking-[-0.04em] sm:w-auto sm:shrink-0 sm:whitespace-nowrap sm:pt-5 sm:pb-5"
            >
              {/* Mobile: plain text + star, wraps. Desktop: Shuffle reel
                * around each word, with the star between, all on one line.
                * StarGlyph drops to currentColor so it tracks the headline
                * across themes. */}
              <span aria-hidden="true" className="sm:hidden">
                {locale === "en" ? <HeadlineShuffle text={titleA} /> : titleA}{" "}
                <StarGlyph className="-mt-1 inline-block size-[0.65em] align-middle" />{" "}
                {locale === "en" ? <HeadlineShuffle text={titleB} /> : titleB}
              </span>
              <span
                aria-hidden="true"
                className="hidden sm:inline-flex sm:items-baseline sm:gap-[0.18em]"
              >
                {locale === "en" ? <HeadlineShuffle text={titleA} /> : titleA}
                <StarGlyph className="inline-block size-[0.55em] shrink-0 self-center" />
                {locale === "en" ? <HeadlineShuffle text={titleB} /> : titleB}
              </span>
            </h1>
          </div>

          {/* Bottom marquee (below headline) — flips direction so the
            * pair reads as a frame around the headline. */}
          <BinaryMarquee feed={BINARY_FEED} reverse />
        </div>
      </HeroBootSequence>
    </section>
  );
}

/**
 * Headline word — single set of Shuffle props in one place. Tuned as
 * an ambient detail: short scramble, small motion travel, long pause
 * between loops so the eye lands on the word, not the animation.
 */
function HeadlineShuffle({ text }: { text: string }) {
  return (
    <Shuffle
      text={text}
      duration={0.45}
      density={0.25}
      loop
      loopDelay={4}
      triggerOnHover
      shuffleDirection="up"
    />
  );
}

/**
 * Thin marquee strip used as the binary-feed bookends around the
 * headline. Doubled track for seamless loop. Reduced-motion → static.
 * `reverse` flips direction (used for the bottom strip so the two
 * read as a frame, not a parallel pair).
 *
 * Each feed segment is a `DecryptedText animateOn="hover"` — pointing
 * at the strip scrambles the glyphs that segment shows and resolves
 * back when the cursor leaves.
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
      className="relative overflow-hidden border-y border-foreground/15 py-1"
    >
      <div className="pointer-events-none absolute inset-0 mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]" />
      <div
        className="flex w-max gap-12 whitespace-nowrap font-mono text-[0.55rem] uppercase tracking-[0.3em] text-foreground/55 motion-safe:animate-[marquee_38s_linear_infinite]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {[0, 1, 2, 3].map((i) => (
          <DecryptedText
            key={i}
            text={feed}
            animateOn="hover"
            sequential
            speed={22}
            useOriginalCharsOnly
            className="text-foreground/55"
            encryptedClassName="text-foreground/30"
          />
        ))}
      </div>
    </div>
  );
}
