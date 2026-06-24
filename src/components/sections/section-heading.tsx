import { HeadingReveal } from "@/components/motion/heading-reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Heading level; `h2` default. Use `h1` on archive pages; detail pages own their own h1. */
  as?: "h1" | "h2";
  /** Disable the single-shot glitch reveal on the h1 (falls back to the editorial word reveal). */
  disableGlitch?: boolean;
}

// Typographic scale for the two heading levels. The reveal choreography itself
// lives in `HeadingReveal`; this component owns the type + the variant policy.
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
  // h1 hero titles keep the single-shot glitch (unless disabled); every h2
  // section heading now gets the editorial per-word reveal that used to be
  // missing — so titles deeper in the page animate in on scroll, not just the
  // hero. The Risograph two-ink overprint stays scoped to the h1.
  const variant =
    as === "h1" ? (disableGlitch ? "editorial" : "glitch") : "editorial";

  return (
    <HeadingReveal
      as={as}
      variant={variant}
      eyebrow={eyebrow}
      title={title}
      description={description}
      titleClassName={headingClass[as]}
      overprint={as === "h1"}
    />
  );
}
