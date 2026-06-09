import { GlitchText } from "@/components/motion/glitch-text";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Heading level; `h2` default. Use `h1` on archive pages; detail pages own their own h1. */
  as?: "h1" | "h2";
  /** Disable the single-shot glitch reveal on the h1. */
  disableGlitch?: boolean;
}

const headingClass = {
  h1: "mt-4 text-[2.6rem] font-[700] leading-[0.98] tracking-[-0.02em] text-balance sm:text-6xl lg:text-7xl",
  h2: "mt-3 text-3xl font-[700] leading-[1.02] tracking-[-0.015em] text-balance sm:text-4xl lg:text-5xl",
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  as = "h2",
  disableGlitch = false,
}: SectionHeadingProps) {
  const Heading = as;
  const useGlitch = as === "h1" && !disableGlitch;
  // The Risograph theme slips a two-ink misregistration behind h1 hero
  // titles (the `m4-overprint` CSS is gated to `[data-palette="risograph"]`,
  // so every other theme renders this untouched). `data-text` carries the
  // glyphs the ::before/::after ghosts duplicate.
  const overprint = as === "h1";
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="flex items-center gap-3">
          {/* Kinetic three-ink tick — the theme's full ink trio drifts
            * through this rule, the editorial signature on every header.
            * Decorative; the eyebrow text carries the meaning. */}
          <span
            aria-hidden="true"
            className="kinetic-rule h-0.75 w-9 shrink-0 rounded-full"
          />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {eyebrow}
          </p>
        </div>
      ) : null}
      <Heading
        className={cn(headingClass[as], overprint && "m4-overprint")}
        data-text={overprint ? title : undefined}
      >
        {useGlitch ? <GlitchText>{title}</GlitchText> : title}
      </Heading>
      {description ? (
        <p className="mt-4 max-w-2xl font-prose text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
