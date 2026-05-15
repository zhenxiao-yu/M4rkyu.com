import { cn } from "@/lib/utils";

interface AsciiTextProps {
  /** The ASCII art block. Newlines preserved verbatim. */
  art: string;
  className?: string;
}

/**
 * Decorative ASCII block rendered into a `<pre>` with muted opacity.
 * Always `aria-hidden`; the visible heading must announce the same word
 * through normal text so screen readers aren't given junk.
 */
export function AsciiText({ art, className }: AsciiTextProps) {
  return (
    <pre
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none whitespace-pre font-mono text-[0.55rem] leading-[0.85] tracking-tight text-foreground/12 dark:text-foreground/16",
        className,
      )}
    >
      {art}
    </pre>
  );
}
