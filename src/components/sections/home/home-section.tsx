import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
   * Whether the section is a snap-point in the home spine.
   *
   * `true` (default) — forces `min-h-dvh`, emits `data-snap="section"`,
   *   and vertically centers content. Use for tentpole moments (Hero,
   *   Selected Work, Closing CTA).
   * `false` — section sizes to content with the standard
   *   `py-24 sm:py-28 lg:py-32` rhythm; no snap. Use for soft sections
   *   (Compass, Writing Pulse) so the home doesn't pay 100vh per band.
   */
  snap?: boolean;
  /** Section content. */
  children: ReactNode;
  /** Forwarded for special cases (the SelectedWork backdrop). */
  className?: string;
  /** Optional data attribute used by tests / debugging. */
  dataSection?: string;
}

/**
 * Shared shell every home-page section composes through. Locks down:
 *
 *   - Vertical rhythm: `py-24 sm:py-28 lg:py-32`
 *   - Inner container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`
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
  snap = true,
  children,
  className,
  dataSection,
}: HomeSectionProps) {
  return (
    <section
      data-section={dataSection}
      data-snap={snap ? "section" : "skip"}
      className={cn(
        "relative isolate flex flex-col",
        snap ? "min-h-dvh justify-center" : "justify-start",
        tone === "muted" && "bg-muted/8 dark:bg-muted/10",
        "py-24 sm:py-28 lg:py-32",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || heading || lede || action) && (
          <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-2xl">
              {eyebrow ? (
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              {heading ? (
                <h2 className="mt-4 font-heading text-balance text-4xl font-semibold leading-[1.02] tracking-normal sm:text-5xl lg:text-6xl">
                  {heading}
                </h2>
              ) : null}
              {lede ? (
                <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                  {lede}
                </p>
              ) : null}
            </div>
            {action ? (
              <div className="md:justify-self-end">{action}</div>
            ) : null}
          </header>
        )}
        <div className={cn((eyebrow || heading || lede) && "mt-14")}>
          {children}
        </div>
      </div>
    </section>
  );
}
