import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { Shuffle } from "@/components/ui/magic/shuffle";

/**
 * HeroWordmark — the homepage's centred focal logo "Compile ✦ Compose".
 *
 * Both words are 7 letters, so the StarGlyph (the i18n "+" turned jewel)
 * sits dead-centre on desktop and drops to its own centred line on mobile.
 * The words auto-shuffle via `Shuffle` (a looping per-char scramble pulse,
 * re-fired on hover; static on touch / reduced motion by design). Blocky
 * look = uppercase Clash Display black, spaced letters, and a hard
 * accent-ink offset shadow. The star re-inks per palette and spins on
 * hover. `data-boot="headline"` so the boot timeline fades it in.
 *
 * Server component — the only interactive parts are the `Shuffle` client
 * islands and the CSS-only star hover, so no client boundary is needed
 * here. Pointer/touch richness lives in the interactive backdrop.
 */
export function HeroWordmark({
  wordA,
  wordB,
  spokenTitle,
}: {
  wordA: string;
  wordB: string;
  spokenTitle: string;
}) {
  return (
    <h1
      data-boot="headline"
      aria-label={spokenTitle}
      className="group font-display w-full px-1 text-center text-[clamp(2.75rem,8vw,8.5rem)] leading-[0.85] font-black tracking-wider uppercase select-none sm:w-auto sm:whitespace-nowrap"
      style={{
        textShadow:
          "0.05em 0.05em 0 color-mix(in srgb, var(--ring) 78%, transparent)",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex flex-wrap items-center justify-center gap-x-[0.16em] gap-y-2 sm:flex-nowrap"
      >
        <ShuffleWord text={wordA} />
        {/* Centre jewel — own line on mobile (basis-full), re-inks per
          * palette, spins on hover. The offset shadow never touches the
          * SVG so the star stays crisp. */}
        <span className="inline-flex basis-full shrink-0 justify-center sm:basis-auto">
          <StarGlyph
            className="size-[0.62em] text-ring transition-transform duration-(--motion-medium) ease-(--ease-premium) motion-safe:group-hover:rotate-20 motion-safe:group-hover:scale-110"
            style={{
              filter:
                "drop-shadow(0 0 18px color-mix(in srgb, var(--ring) 55%, transparent))",
            }}
          />
        </span>
        <ShuffleWord text={wordB} />
      </span>
    </h1>
  );
}

function ShuffleWord({ text }: { text: string }) {
  return (
    <Shuffle
      text={text}
      duration={0.45}
      density={0.22}
      loop
      loopDelay={4.5}
      triggerOnHover
      shuffleDirection="up"
    />
  );
}
