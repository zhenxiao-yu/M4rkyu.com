import { cn } from "@/lib/utils";

interface CaseStudySectionProps {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}

const monoEyebrow =
  "font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground";

/**
 * Editorial wrapper for prose-heavy sections of a case study.
 * Owns the eyebrow + heading rhythm so the page composition stays consistent.
 */
export function CaseStudySection({
  eyebrow,
  title,
  children,
  className,
  as = "h2",
}: CaseStudySectionProps) {
  const Heading = as;
  return (
    <section className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className={monoEyebrow}>{eyebrow}</p> : null}
      <Heading className="mt-3 text-2xl font-semibold leading-snug text-balance sm:text-3xl">
        {title}
      </Heading>
      <div className="mt-5 text-base leading-8 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

interface CaseStudyListProps {
  items: string[];
  numbered?: boolean;
  className?: string;
}

export function CaseStudyList({ items, numbered, className }: CaseStudyListProps) {
  if (items.length === 0) return null;
  if (numbered) {
    return (
      <ol className={cn("grid gap-3", className)}>
        {items.map((item, index) => (
          <li
            key={`${index}-${item}`}
            className="grid grid-cols-[2.25rem_1fr] items-start gap-3"
          >
            <span className="pt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-base leading-7 text-foreground">{item}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className={cn("grid gap-2.5", className)}>
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="flex gap-3 text-sm leading-7 text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
