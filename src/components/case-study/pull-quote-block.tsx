import { cn } from "@/lib/utils";

interface PullQuoteBlockProps {
  eyebrow?: string;
  quote: string;
  attribution?: string;
  className?: string;
}

/**
 * Editorial pull-quote. Used once per case study, typically over the
 * "outcome" block. Display family, generous measure, no decoration.
 */
export function PullQuoteBlock({
  eyebrow,
  quote,
  attribution,
  className,
}: PullQuoteBlockProps) {
  return (
    <figure
      className={cn(
        "relative mx-auto max-w-4xl border-y py-12 sm:py-16",
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <blockquote className="mt-4 text-balance font-[family-name:var(--font-display)] text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {quote}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
