import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { Button } from "@/components/ui/button";
import { HeroBootSequence } from "./hero-boot-sequence";
import { HeroScrollCue } from "./hero-scroll-cue";
import { RisographMarks } from "./risograph-marks";
import type { Locale } from "@/i18n/routing";

/**
 * Hero — a registered risograph broadsheet.
 *
 * The flagship Risograph Press direction printed as a single proofed
 * sheet: warm paper + halftone screen (both global, via body::before),
 * an edition masthead, and a giant `Creative ✦ Developer.` headline that
 * carries the theme's signature `.m4-overprint` ink misregistration —
 * vermilion + cobalt ghosts that slide in and *register* on load. The
 * `+` from the i18n title becomes the StarGlyph jewel, tinted to the
 * live `--ring` ink so it re-inks per palette.
 *
 * Everything reads from semantic tokens, so on terminal / editorial the
 * overprint + print-marks gracefully no-op and the poster still holds as
 * a strong editorial layout. Motion is owned by HeroBootSequence
 * (reduced-motion-safe) plus the CSS registration-settle.
 */
export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });

  // Split the title at "+" so the StarGlyph can sit between the two
  // words while each side still flows as plain display type. `spokenTitle`
  // feeds both the a11y label and the overprint ghosts' `data-text`.
  const title = t("title");
  const [titleA, titleB] = title.includes("+")
    ? title.split("+").map((s) => s.trim())
    : [title, ""];
  const spokenTitle = title.replace("+", " ").replace(/\s+/g, " ").trim();
  // The overprint ghosts (.m4-overprint::before/::after) duplicate the
  // title via `data-text` as plain glyphs. Use an em-space where the inline
  // StarGlyph sits so the ghost tracks the real word spacing and reads as
  // ink misregistration rather than a stray offset.
  const overprintText = titleB ? `${titleA} ${titleB}` : spokenTitle;

  const status = [
    t("heroStatus.line2"),
    t("heroStatus.line3"),
    t("heroStatus.line4"),
  ];

  return (
    <section
      data-snap="section"
      className="relative isolate flex min-h-dvh flex-col overflow-hidden border-b"
    >
      {/* Atmosphere — an oversized registration star bleeding off the
        * bottom-left, the way a proof sheet carries an outsized folio mark.
        * Pure decoration; tinted to the live ink at a whisper of opacity. */}
      <StarGlyph
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[18%] -left-[10%] -z-10 size-[68vmin] rotate-12 text-ring/[0.05]"
      />

      <HeroBootSequence>
        <div className="flex min-h-dvh flex-col px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
          {/* Masthead — edition line. Mono caps over a hairline rule, like
            * the header of a printed sheet. */}
          <header
            data-boot="eyebrow"
            className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground"
          >
            <span className="text-foreground/80">{t("eyebrow")}</span>
            <span>{t("heroTagline")}</span>
          </header>

          {/* Stage — headline + colophon rail. Asymmetric 12-col grid on
            * desktop; the rail stacks beneath on smaller sheets. */}
          <div className="grid flex-1 grid-cols-1 content-center gap-y-10 py-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <h1
                data-boot="headline"
                data-text={overprintText}
                aria-label={spokenTitle}
                className="m4-overprint font-display max-w-[15ch] text-[clamp(2.75rem,9vw,8.75rem)] font-black leading-[0.84] tracking-[-0.04em] text-balance"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex flex-wrap items-baseline gap-x-[0.16em] gap-y-1"
                >
                  {titleA}
                  <StarGlyph
                    className="inline-block size-[0.52em] shrink-0 self-center text-ring"
                    style={{
                      filter:
                        "drop-shadow(0 0 14px color-mix(in srgb, var(--ring) 45%, transparent))",
                    }}
                  />
                  {titleB}
                </span>
              </h1>

              <p
                data-boot="subtitle"
                className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:mt-7 sm:text-lg"
              >
                {t("subtitle")}
              </p>

              <div
                data-boot="ctas"
                className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-9"
              >
                <Button asChild>
                  <Link href="/work">
                    {t("heroCtaBrowse")}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/logs">{t("heroCtaLogs")}</Link>
                </Button>
                <span className="ml-1 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {t("heroCmdkHint")}
                </span>
              </div>
            </div>

            {/* Colophon rail — the print metadata. Left hairline rule does
              * the visual work; mono spec lines read as proof annotations.
              * Stacks below the headline on mobile (border flips to top). */}
            <aside
              data-boot="hud"
              className="border-t border-border/60 pt-5 lg:col-span-4 lg:justify-self-end lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-foreground/70">
                {t("heroTagShort")}
              </p>
              <ul className="mt-4 grid gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                {status.map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-ring">
                      ✦
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </HeroBootSequence>

      {/* Press-proof chrome — registration target + spot-ink bar + proof
        * label. Self-gates to the risograph palette (no-op elsewhere). */}
      <RisographMarks />

      {/* Scroll-on cue — floats above the bottom edge, jumps to the next
        * snap section. */}
      <HeroScrollCue className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2" />
    </section>
  );
}
