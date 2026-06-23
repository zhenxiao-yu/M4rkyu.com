import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "./section-eyebrow";

interface HomeSectionProps {
  /** Optional eyebrow line — small mono caps. */
  eyebrow?: ReactNode;
  /** Section heading. ReactNode so we can drop in `<GhostedWord>` etc. */
  heading?: ReactNode;
  /** One-paragraph lede below the heading. */
  lede?: ReactNode;
  /** Optional right-aligned action (typically a Link with ArrowUpRight). */
  action?: ReactNode;
  /** Tint variant for visual rhythm between sections. */
  tone?: "default" | "muted";
  /**
   * Header + content alignment.
   *
   * `"left"` (default) — the editorial spine: eyebrow → heading → lede
   *   flush-left, optional action pinned right. Every body section uses this
   *   so headings share one left edge as you scroll.
   * `"center"` — a deliberate centerpiece (the Ask terminal). Heading is
   *   centered above centered content so the title sits over its console
   *   instead of drifting to the side. `action` is ignored in this mode.
   */
  align?: "left" | "center";
  /**
   * Whether the section is a full-height stage in the home spine.
   *
   * `true` (default) — forces `min-h-dvh` and vertically centers content.
   *   Use for tentpole moments (Hero, Selected Work, Closing CTA).
   * `false` — section sizes to content with the standard
   *   `py-24 sm:py-28 lg:py-32` rhythm. Use for soft sections (Compass,
   *   Writing Pulse) so the home doesn't pay 100vh per band.
   */
  snap?: boolean;
  /** Section content. */
  children: ReactNode;
  /**
   * Full-bleed atmospheric backdrop (typically `<SectionBackground />`).
   * Rendered as the section's first child so it fills the whole stage behind
   * the content; the component itself owns its
   * `absolute inset-0 -z-10` positioning.
   */
  background?: ReactNode;
  /** Forwarded for special cases (the SelectedWork backdrop). */
  className?: string;
  /** Optional data attribute used by tests / debugging. */
  dataSection?: string;
  /**
   * Embedded mode — renders the inner content only (no `<section>`, no
   * `min-h-dvh`, no own backdrop, a smaller `h3` heading, compact padding),
   * so a parent "act" stage can group several sections under one shared
   * `<section>` + backdrop. The act owns the `max-w-page` container, so
   * embedded sections don't re-wrap it. `snap`, `tone`, `background`, and
   * `dataSection` are ignored in this mode.
   */
  embedded?: boolean;
}

/**
 * Shared shell every home-page section composes through. Locks down:
 *
 *   - Vertical rhythm: `py-24 sm:py-28 lg:py-32`
 *   - Inner container: `mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8`
 *   - Header pattern: eyebrow → heading → lede on the left,
 *     optional action link on the right (stacks under header on mobile)
 *   - Spacing between header and content: `mt-14`
 *   - Tone: `default` (transparent) or `muted` (subtle tint) for the
 *     alternating-row rhythm without competing with the global page
 *     background.
 *
 * Existing sections were each inlining their own version of this and
 * drifting on small details (mt-10 vs mt-12, py-20 vs py-28, eyebrow
 * tracking 0.3em vs 0.32em). Centralising here means every section
 * shares one rhythm and the home reads as one piece.
 */
export function HomeSection({
  eyebrow,
  heading,
  lede,
  action,
  tone = "default",
  align = "left",
  snap = true,
  children,
  background,
  className,
  dataSection,
  embedded = false,
}: HomeSectionProps) {
  const centered = align === "center";

  // Embedded — inner content only, for an "act" stage that groups several
  // sections under one shared <section> + backdrop. No section shell, no
  // max-w-page container (the act provides it), a quieter h3 heading.
  if (embedded) {
    return (
      <div data-section={dataSection} className={cn("flex flex-col", className)}>
        {(eyebrow || heading || lede || action) && (
          <header
            className={cn(
              centered
                ? "flex flex-col items-center text-center"
                : "grid gap-4 md:grid-cols-[1fr_auto] md:items-end md:gap-6",
            )}
          >
            <div className={cn("max-w-2xl", centered && "mx-auto")}>
              {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
              {heading ? (
                <h3 className="mt-2 font-heading text-balance text-2xl font-semibold leading-[1.08] tracking-normal sm:mt-3 sm:text-3xl lg:text-4xl">
                  {heading}
                </h3>
              ) : null}
              {lede ? (
                <p
                  className={cn(
                    "mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7",
                    centered && "mx-auto",
                  )}
                >
                  {lede}
                </p>
              ) : null}
            </div>
            {action && !centered ? (
              <div className="md:justify-self-end">{action}</div>
            ) : null}
          </header>
        )}
        <div className={cn((eyebrow || heading || lede) && "mt-6 sm:mt-8")}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <section
      data-section={dataSection}
      data-home-section={snap ? "stage" : "section"}
      className={cn(
        "relative isolate flex flex-col",
        snap ? "min-h-dvh justify-center" : "justify-start",
        tone === "muted" && "bg-muted/8 dark:bg-muted/10",
        // Mobile pays a real cost on tall snap sections: with min-h-dvh
        // and justify-center, the empty bands either side of content
        // compound the outer padding. Halve the mobile padding so the
        // section reads as one breath instead of a long inhale; sm+
        // keeps the original generous rhythm.
        "py-16 sm:py-24 lg:py-32",
        className,
      )}
    >
      {background}
      <div className="relative mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8">
        {(eyebrow || heading || lede || action) && (
          <header
            className={cn(
              centered
                ? "flex flex-col items-center text-center"
                : "grid gap-5 md:grid-cols-[1fr_auto] md:items-end md:gap-6",
            )}
          >
            <div className={cn("max-w-2xl", centered && "mx-auto")}>
              {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
              {heading ? (
                <h2 className="mt-3 font-heading text-balance text-[2rem] font-semibold leading-[1.04] tracking-normal sm:mt-4 sm:text-5xl sm:leading-[1.02] lg:text-6xl">
                  {heading}
                </h2>
              ) : null}
              {lede ? (
                <p
                  className={cn(
                    "mt-4 max-w-xl text-base leading-7 text-muted-foreground",
                    centered && "mx-auto",
                  )}
                >
                  {lede}
                </p>
              ) : null}
            </div>
            {action && !centered ? (
              <div className="md:justify-self-end">{action}</div>
            ) : null}
          </header>
        )}
        <div
          className={cn(
            (eyebrow || heading || lede) && "mt-8 sm:mt-12 lg:mt-14",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
