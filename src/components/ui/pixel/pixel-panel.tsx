import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pixelPanelVariants = cva(
  "relative rounded-sm border border-border",
  {
    variants: {
      tone: {
        default: "bg-card text-card-foreground",
        // Inverted surface — `--surface-ink` flips between dark/light by
        // theme (see globals.css :root vs [data-theme="dark"]), so the
        // panel always reads as a stamped surface against the page.
        ink: "bg-[var(--surface-ink)] text-[var(--surface-paper)] border-transparent",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

// Top-right corner notch — kept off below `sm:` to avoid awkward clipping
// on narrow viewports. The 12px polygon is the cartridge-corner motif
// referenced in docs/UNIFIED_VISUAL_DIRECTION.md §4.5.
const NOTCH_CLASS =
  "sm:[clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,0_100%)]";

export interface PixelPanelProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof pixelPanelVariants> {
  /**
   * Title-bar headline rendered in VT323. Promotes the wrapper to
   * `<section aria-labelledby>`. ASCII-friendly only — mixed-script
   * titles (e.g. "Project 项目") render the non-Latin portion in the
   * fallback font; for fully Chinese titles the `:lang(zh)` guard in
   * globals.css already redirects `--font-pixel` to the display stack.
   */
  title?: string;
  /** Short uppercase mono eyebrow on the left side of the title bar. */
  eyebrow?: string;
  /** Render a 12px cartridge corner notch on the top-right (sm+). */
  notch?: boolean;
  /**
   * Document-outline level for the title bar headline. Defaults to `2`
   * because PixelPanel typically opens a top-level section, but consumers
   * nested under a page `<h1>`+`<h2>` (e.g. CommandHero inside the hero)
   * should pass `3` so the outline stays sequential. Phase 8 a11y fix.
   */
  headingLevel?: 2 | 3;
}

export function PixelPanel({
  title,
  eyebrow,
  tone,
  notch = false,
  headingLevel = 2,
  className,
  children,
  ...rest
}: PixelPanelProps) {
  const titleId = React.useId();
  const hasHeader = Boolean(title || eyebrow);
  const Element: React.ElementType = title ? "section" : "div";
  const Heading: React.ElementType = headingLevel === 3 ? "h3" : "h2";

  return (
    <Element
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        pixelPanelVariants({ tone }),
        notch && NOTCH_CLASS,
        className,
      )}
      {...rest}
    >
      {hasHeader ? (
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
          {/* Left cluster — eyebrow + title share a baseline-aligned flex
            * row so the layout collapses cleanly when only one is supplied
            * (no empty spacer pushing the title to the right edge). */}
          <div className="flex items-baseline gap-3">
            {eyebrow ? (
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <Heading
                id={titleId}
                className="font-pixel text-base normal-case tracking-normal text-foreground"
              >
                {title}
              </Heading>
            ) : null}
          </div>
          {/* Right slot — empty in Phase 2. Phase 6 (StatusPulse) lands
            * the live/now indicator here without disturbing layout. */}
          <span aria-hidden="true" />
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </Element>
  );
}
