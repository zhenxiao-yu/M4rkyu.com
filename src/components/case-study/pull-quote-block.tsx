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
        "relative isolate mx-auto max-w-4xl border-y py-12 sm:py-16",
        className,
      )}
    >
      {/* Oversized opening quote — the star serif as a faint riso watermark.
       * Decorative + aria-hidden; sits at -z-10 within the figure's own
       * stacking context (isolate) so the quote reads cleanly over it, and
       * stays inside the figure (no negative inset → no mobile overflow). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-5 -z-10 select-none font-display text-[5rem] font-semibold leading-none text-ring/15 sm:top-3 sm:text-[7rem]"
      >
        &ldquo;
      </span>
      {eyebrow ? (
        <p className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          <span aria-hidden="true" className="h-px w-8 bg-foreground/20" />
          {eyebrow}
        </p>
      ) : null}
      <blockquote
        className={cn(
          "text-balance font-display text-2xl font-medium leading-[1.2] tracking-tight text-foreground sm:text-3xl sm:leading-[1.18] lg:text-4xl lg:leading-[1.15]",
          eyebrow ? "mt-5" : "",
        )}
      >
        {quote}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span aria-hidden="true" className="h-px w-6 bg-foreground/20" />
          {/* sr-only em-dash keeps the attribution audibly separated from the quote. */}
          <span className="sr-only">— </span>
          <cite className="not-italic">{attribution}</cite>
        </figcaption>
      ) : null}
    </figure>
  );
}
