import { GlitchText } from "@/components/motion/glitch-text";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /**
   * Heading level. Defaults to `h2`. Use `h1` when this is the page's
   * top-level title (most archive pages — /projects, /games, /blog, etc.).
   * Detail pages should keep this as `h2` because they own their own
   * `h1` via `CaseStudyHeader` / `GameDetailHeader`.
   */
  as?: "h1" | "h2";
  /**
   * Opt out of the single-shot glitch effect on the H1. Defaults to
   * false so archive page titles get the entry animation; pages
   * that want a quieter reveal (or already animate the title via
   * another path) can disable it.
   */
  disableGlitch?: boolean;
}

const headingClass =
  "mt-3 text-3xl font-[700] leading-[1.05] tracking-normal text-balance sm:text-4xl lg:text-5xl";

export function SectionHeading({
  eyebrow,
  title,
  description,
  as = "h2",
  disableGlitch = false,
}: SectionHeadingProps) {
  const Heading = as;
  const useGlitch = as === "h1" && !disableGlitch;
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <Heading className={headingClass}>
        {useGlitch ? <GlitchText>{title}</GlitchText> : title}
      </Heading>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
