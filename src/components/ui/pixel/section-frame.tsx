import * as React from "react";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { cn } from "@/lib/utils";

type FrameMode = "default" | "panel";

export interface SectionFrameProps {
  /** Mono numerical index glyph (e.g. "01"). Rendered in VT323 before the title. */
  index?: string;
  /** Short uppercase mono eyebrow (e.g. "selected · missions"). */
  eyebrow?: string;
  /** Section heading — string for simple titles, ReactNode when you
   * need to drop an animated primitive (e.g. `<GhostedWord>`) inside. */
  title: React.ReactNode;
  /** One-paragraph lede under the title. */
  lede?: string;
  /** Inline actions rendered on the right (typically a small CTA group). */
  actions?: React.ReactNode;
  /** "panel" wraps the header in a bordered surface for sub-sections. */
  frame?: FrameMode;
  className?: string;
}

export function SectionFrame({
  index,
  eyebrow,
  title,
  lede,
  actions,
  frame = "default",
  className,
}: SectionFrameProps) {
  return (
    // BlurFade lives INSIDE the <header> so the landmark stays at the
    // outer DOM level — parent layouts can target the header with
    // id / aria-labelledby without piercing the motion wrapper.
    <header
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        frame === "panel" &&
          "rounded-sm border border-border bg-card px-5 py-4",
        className,
      )}
    >
      <BlurFade className="flex max-w-3xl flex-col gap-2">
        {(index || eyebrow) ? (
          <div className="flex flex-wrap items-baseline gap-3">
            {index ? (
              <span
                aria-hidden="true"
                className="font-pixel text-xl leading-none text-muted-foreground"
              >
                {index}
              </span>
            ) : null}
            {eyebrow ? (
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
          </div>
        ) : null}
        <h2 className="font-heading text-balance text-3xl font-bold leading-[1.05] tracking-normal sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {lede ? (
          <p className="mt-1 max-w-2xl text-base leading-7 text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </BlurFade>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
