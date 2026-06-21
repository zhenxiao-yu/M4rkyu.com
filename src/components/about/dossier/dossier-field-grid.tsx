import { CountUp } from "@/components/ui/magic/count-up";
import { cn, FOCUS_RING, PANEL_TILE } from "@/lib/utils";

export interface DossierFieldRow {
  label: string;
  value: string;
  /** Renders the value as a link (e.g. a mailto). */
  href?: string;
  /** Dims the value — for pending / placeholder entries. */
  muted?: boolean;
}

export interface DossierCoverageStat {
  value: number;
  label: string;
}

interface DossierFieldGridProps {
  rows: DossierFieldRow[];
  coverageLabel: string;
  stats: DossierCoverageStat[];
}

/**
 * The IDENTITY exhibit: a ruled definition list of field/value rows followed
 * by a COVERAGE strip of counting stats. Pure markup over tokens — the only
 * client island is <CountUp>, which settles to its final number under
 * reduced motion.
 */
export function DossierFieldGrid({
  rows,
  coverageLabel,
  stats,
}: DossierFieldGridProps) {
  return (
    <div>
      <dl className="divide-y divide-border/50">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(6rem,8.5rem)_1fr] items-baseline gap-3 py-2.5 first:pt-0 sm:gap-5"
          >
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-hud-muted">
              {row.label}
            </dt>
            <dd className="min-w-0 text-sm text-foreground/90">
              {row.href ? (
                <a
                  href={row.href}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 break-all underline decoration-ring/40 underline-offset-4 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:decoration-ring",
                    FOCUS_RING,
                  )}
                >
                  {row.value}
                </a>
              ) : (
                <span className={cn(row.muted && "text-muted-foreground")}>
                  {row.value}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-border/50 pt-4">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-hud-muted">
          {coverageLabel}
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(PANEL_TILE, "px-3 py-2.5")}
            >
              <p className="font-display text-2xl leading-none tabular-nums sm:text-3xl">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
