"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GithubStats } from "@/app/api/about/github/route";

type LoadState = "loading" | "ready" | "error";

// Token-driven slice color: each language fades from full --ring to
// muted-foreground at lower opacities by index. Keeps the chart on
// one accent instead of inventing a per-language palette.
function sliceTint(index: number, total: number) {
  const ratio = total > 1 ? 1 - index / (total - 1) : 1;
  // Range from 88% --ring → 30% --foreground.
  const ringWeight = Math.round(30 + ratio * 58);
  return `color-mix(in srgb, var(--ring) ${ringWeight}%, color-mix(in srgb, var(--foreground) 40%, transparent))`;
}

export function GithubChartsCard({ className }: { className?: string }) {
  const t = useTranslations("About.charts");
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/about/github")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as GithubStats | null;
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setLoadState(data ? "ready" : "error");
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCommits =
    stats?.weeklyCommits.reduce((s, w) => s + w, 0) ?? 0;
  const totalBytes =
    stats?.languageBytes.reduce((s, l) => s + l.bytes, 0) ?? 0;

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-[auto,1fr] sm:items-start">
        {/* Donut — languages by bytes */}
        <div className="grid gap-3">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            {t("languagesTitle")}
          </p>
          {stats && stats.languageBytes.length > 0 && totalBytes > 0 ? (
            <Donut
              slices={stats.languageBytes}
              total={totalBytes}
              reduced={!!reduced}
            />
          ) : (
            <DonutPlaceholder loaded={loadState !== "loading"} />
          )}
        </div>

        {/* Sparkline — last 8 weeks of commits */}
        <div className="grid gap-3">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            {t("commitsTitle")}
          </p>
          {stats && stats.weeklyCommits.length > 0 ? (
            <>
              <Sparkline
                values={stats.weeklyCommits}
                reduced={!!reduced}
              />
              <p className="font-mono text-[0.6rem] text-muted-foreground">
                {t("commits8w", { count: totalCommits })}
              </p>
            </>
          ) : (
            <SparkPlaceholder loaded={loadState !== "loading"} />
          )}
        </div>

        {loadState === "error" && !stats ? (
          <p className="text-xs text-muted-foreground sm:col-span-2">
            {t("loadFailed")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Donut({
  slices,
  total,
  reduced,
}: {
  slices: { name: string; bytes: number }[];
  total: number;
  reduced: boolean;
}) {
  const SIZE = 132;
  const STROKE = 14;
  const r = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * r;

  // Precompute cumulative fractions so each slice gets the correct
  // starting offset on the donut perimeter.
  const cumulativeBefore: number[] = [];
  slices.reduce((acc, s, i) => {
    cumulativeBefore[i] = acc;
    return acc + s.bytes / total;
  }, 0);
  const drawn = slices.map((s, i) => {
    const frac = s.bytes / total;
    return {
      ...s,
      frac,
      dash: frac * C,
      offset: -(cumulativeBefore[i] * C),
      idx: i,
    };
  });

  return (
    <div className="grid items-center gap-3 sm:grid-cols-[auto,minmax(0,1fr)]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="block shrink-0"
        role="img"
        aria-label="Languages donut"
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-muted-foreground/15"
        />
        {/* Slices, rotated -90° so 0% starts at 12 o'clock */}
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {drawn.map((s) => (
            <motion.circle
              key={s.name}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={r}
              fill="none"
              stroke={sliceTint(s.idx, slices.length)}
              strokeWidth={STROKE}
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              initial={reduced ? undefined : { strokeDasharray: `0 ${C}` }}
              animate={
                reduced
                  ? undefined
                  : { strokeDasharray: `${s.dash} ${C - s.dash}` }
              }
              transition={{
                duration: 0.7,
                delay: 0.08 * s.idx,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            />
          ))}
        </g>
      </svg>
      <ul className="grid gap-1 text-xs">
        {drawn.map((s) => (
          <li key={s.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2 shrink-0 rounded-sm"
              style={{ background: sliceTint(s.idx, slices.length) }}
            />
            <span className="truncate text-foreground">{s.name}</span>
            <span className="ml-auto shrink-0 font-mono tabular-nums text-[0.65rem] text-muted-foreground">
              {Math.round(s.frac * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sparkline({
  values,
  reduced,
}: {
  values: number[];
  reduced: boolean;
}) {
  const W = 240;
  const H = 64;
  const PAD = 4;
  const max = Math.max(1, ...values);
  const stepX = (W - PAD * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = PAD + i * stepX;
    const y = PAD + (1 - v / max) * (H - PAD * 2);
    return { x, y, v };
  });
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Area beneath the line: close to bottom corners.
  const dArea =
    `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD} ` +
    `L ${pts[0].x.toFixed(1)} ${H - PAD} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Weekly commits"
    >
      <motion.path
        d={dArea}
        fill="color-mix(in srgb, var(--ring) 18%, transparent)"
        initial={reduced ? undefined : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ring"
        initial={reduced ? undefined : { pathLength: 0 }}
        animate={reduced ? undefined : { pathLength: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={1.6}
          className="fill-ring"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 + i * 0.04 }}
        />
      ))}
    </svg>
  );
}

function DonutPlaceholder({ loaded }: { loaded: boolean }) {
  return (
    <div className="grid size-[132px] place-items-center rounded-full border border-dashed border-border/60 bg-background/40">
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
        {loaded ? "—" : ""}
      </span>
    </div>
  );
}

function SparkPlaceholder({ loaded }: { loaded: boolean }) {
  return (
    <div className="grid h-16 place-items-center rounded-md border border-dashed border-border/60 bg-background/40">
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
        {loaded ? "—" : ""}
      </span>
    </div>
  );
}
