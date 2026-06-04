"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/ui/magic/count-up";
import { ShinyText } from "@/components/ui/magic/shiny-text";

export interface IndexStat {
  value: number;
  label: string;
  suffix?: string;
}

interface AboutIndexBandProps {
  eyebrow: string;
  caption: string;
  stats: IndexStat[];
}

/**
 * Compact full-width index band: a quiet label on the left, a row of
 * scroll-counted stats on the right separated by hairline dividers.
 * A dense, dashboard-style connective strip between the hero and the
 * detail bento. All values animate on scroll-in via CountUp
 * (reduced-motion sets them immediately).
 */
export function AboutIndexBand({ eyebrow, caption, stats }: AboutIndexBandProps) {
  return (
    <Card className="h-full bg-card/85">
      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
        <div className="grid gap-1">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            <ShinyText duration={6}>{caption}</ShinyText>
          </p>
        </div>

        <dl className="grid grid-cols-3 overflow-hidden rounded-lg border border-border/60 bg-background/35">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-1 px-4 py-3 sm:px-6 sm:py-4 ${
                i > 0 ? "border-l border-border/60" : ""
              }`}
            >
              <dd className="font-display text-3xl leading-none tabular-nums sm:text-4xl">
                <CountUp value={stat.value} />
                {stat.suffix ? (
                  <span className="text-ring">{stat.suffix}</span>
                ) : null}
              </dd>
              <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
