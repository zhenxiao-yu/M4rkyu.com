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
}

const headingClass =
  "mt-3 text-3xl font-[700] leading-[1.05] tracking-normal text-balance sm:text-4xl lg:text-5xl";

export function SectionHeading({
  eyebrow,
  title,
  description,
  as = "h2",
}: SectionHeadingProps) {
  const Heading = as;
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <Heading className={headingClass}>{title}</Heading>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
