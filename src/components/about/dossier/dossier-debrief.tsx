interface DossierDebriefProps {
  /** First-person narrative paragraphs (the warm beat). */
  paragraphs: string[];
  /** Label for the principles aside, e.g. "OPERATING PRINCIPLES". */
  principlesLabel: string;
  /** Short operating principles, numbered in the aside. */
  values: string[];
}

/**
 * The human centre of the dossier — first-person prose set in the long-form
 * reading face with an editorial drop cap, paired with a quiet numbered list
 * of operating principles. Deliberately carries no scanline (its panel uses
 * the `plain` tone): the warmth comes from restraint.
 */
export function DossierDebrief({
  paragraphs,
  principlesLabel,
  values,
}: DossierDebriefProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
      <div className="prose-dropcap max-w-[60ch]">
        <div className="font-prose text-base leading-7 text-foreground/90 sm:text-[1.05rem] sm:leading-8 [&>p+p]:mt-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <aside className="lg:w-56">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-hud-muted">
          {principlesLabel}
        </p>
        <ul className="mt-3 grid gap-2.5">
          {values.map((value, index) => (
            <li
              key={value}
              className="flex items-baseline gap-2.5 text-sm leading-6 text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="font-mono text-xs tabular-nums text-ring"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
