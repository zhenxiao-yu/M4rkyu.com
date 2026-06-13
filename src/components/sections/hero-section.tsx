import { getTranslations } from "next-intl/server";
import { HomeBackdropSwitcher } from "./home-backdrop-switcher";
import { HeroWordmark } from "./hero-wordmark";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { HeroBootSequence } from "./hero-boot-sequence";
import { HeroScrollCue } from "./hero-scroll-cue";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

/**
 * Hero — "Compile ✦ Compose", the homepage's centred focal wordmark over
 * the switchable, mouse-and-touch interactive backdrop.
 *
 *   - Backdrop: HomeBackdropSwitcher (galaxy / iridescence / threads /
 *     grid / waves), interactive on desktop AND mobile.
 *   - Centre: a translucent frosted band framed by two binary-feed
 *     marquees (accent edges facing inward), holding the blocky wordmark.
 *     Both words are 7 letters so the star lands dead-centre; words
 *     auto-shuffle on a fine pointer. The block is vertically centred in
 *     the viewport — the page's focal point.
 *   - Scroll cue floats at the section floor.
 */
export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  // Binary feed — system-telemetry caps text for the two marquee strips.
  const BINARY_FEED =
    "01001101 00110100 01010010 01001011 01011001 01010101 // 0xFF3E // 11000100 01001011 // 01011001 0xCAFE // 0xDEAD 10101010 // 01010011 01011001 01010011 01000011 // 0xA4B7 // 01101111 01110000 01100101 01110010 01100001 01110100 01101001 01101110 01100111";

  // Split the title at "+" so the StarGlyph (the centre jewel) lands
  // between the two 7-letter words. Plain blocky type on every locale:
  // this is an English identity wordmark, not translated copy.
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
      {/* Switchable, interactive backdrop — the centre wow-piece. */}
      <HomeBackdropSwitcher />

      <HeroBootSequence>
        {/* Vertically centre the framed wordmark in the viewport. */}
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center">
          {/* Frosted band — keeps the wordmark legible over any backdrop
            * while the field still reads through. Marquees bookend it with
            * accent edges facing the wordmark. */}
          <div
            data-boot="hud"
            className="relative w-full bg-background/35 backdrop-blur-[2px]"
          >
            <BinaryMarquee feed={BINARY_FEED} edge="bottom" />

            <div className="flex justify-center px-4 py-8 sm:py-12">
              <HeroWordmark
                wordA={titleA}
                wordB={titleB}
                spokenTitle={spokenTitle}
              />
            </div>

            <BinaryMarquee feed={BINARY_FEED} reverse edge="top" />
          </div>
        </div>

        {/* Scroll-on cue — jumps straight to the next snap section. */}
        <HeroScrollCue className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2" />
      </HeroBootSequence>
    </section>
  );
}

/**
 * Binary-feed marquee — a data-ticker strip bookending the wordmark. The
 * accent hairline sits on the edge facing the wordmark (`edge`), so the
 * pair frames the headline. Doubled track for a seamless loop; each
 * segment is a `DecryptedText animateOn="hover"` whose scrambled glyphs
 * flash in the accent ink. Reduced-motion → static.
 */
function BinaryMarquee({
  feed,
  reverse = false,
  edge,
}: {
  feed: string;
  reverse?: boolean;
  edge: "top" | "bottom";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-background/40 py-1.5",
        edge === "bottom" ? "border-b border-ring/25" : "border-t border-ring/25",
      )}
    >
      <div className="pointer-events-none absolute inset-0 mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" />
      <div
        className="flex w-max gap-10 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.38em] text-foreground/45 motion-safe:animate-[marquee_34s_linear_infinite]"
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
            className="text-foreground/45"
            encryptedClassName="text-ring/40"
          />
        ))}
      </div>
    </div>
  );
}
