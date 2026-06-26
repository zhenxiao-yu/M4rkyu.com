"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { AboutSignalsCard } from "@/components/about/about-signals-card";
import { NowConsole } from "@/components/about/now-console";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { BentoTilt } from "@/components/ui/magic/bento-tilt";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { cn } from "@/lib/utils";
import { LoadoutRack, type RackGroup } from "./loadout-rack";

interface Skill {
  label: string;
  group: string;
}
type ToolGroup = [group: string, items: Skill[]];
interface CurrentlyItem {
  kind: string;
  label: string;
  detail?: string;
  url?: string;
}

interface AboutBentoProps {
  /** Skills grouped by section, in the page's canonical group order. */
  toolGroups: ToolGroup[];
  /** The small "currently" status feed from the content layer. */
  currently: CurrentlyItem[];
}

const GROUP_KEY: Record<string, string> = {
  Code: "code",
  Data: "data",
  Creative: "creative",
  Workflow: "workflow",
};

/**
 * Scene 2 — the living bento, the dashboard the hero hands off to. Live GitHub +
 * Steam telemetry proves "engineer who games" with real data; the heavy rotating
 * LoadoutRack cycles the stack by domain; a "currently" feed adds human texture;
 * the journey sits in one thin transit strip. Tiles tilt under the cursor over a
 * faint reactive dot-grid — alive, not flat. All effects reduced-motion + touch
 * safe; the identity now lives in the hero above.
 */
export function AboutBento({ toolGroups, currently }: AboutBentoProps) {
  const t = useTranslations("About");
  const reduced = useReducedMotion();
  const arc = t("dossier.baseArc")
    .split("→")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const rackGroups: RackGroup[] = toolGroups.map(([group, items]) => {
    const key = GROUP_KEY[group] ?? "code";
    return {
      key,
      label: t(`bento.stackGroups.${key}`),
      items: items.map((skill) => ({ label: skill.label })),
    };
  });

  const gridClassName =
    "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4";

  const tiles = (
    <>
      {/* ── Telemetry — live GitHub + Steam ──────────────────────────────── */}
      <Tile
        ariaLabel={t("dossier.telemetryLabel")}
        label={t("dossier.telemetryLabel")}
        sub={t("bento.liveTag")}
        className="sm:col-span-2 lg:col-span-7"
      >
        <AboutSignalsCard bare />
      </Tile>

      {/* ── Now — the interactive tuner console (replaces the static feed) ── */}
      <StaggerItem className="min-w-0 sm:col-span-2 lg:col-span-5">
        <NowConsole items={currently} className="h-full" />
      </StaggerItem>

      {/* ── Loadout — the heavy rotating rack (stack by domain) ──────────── */}
      <StaggerItem className="min-w-0 sm:col-span-2 lg:col-span-12">
        <LoadoutRack groups={rackGroups} />
      </StaggerItem>

      {/* ── Transit — the journey, demoted to a thin baseline strip ──────── */}
      <Tile
        ariaLabel={t("bento.transitLabel")}
        label={t("bento.transitLabel")}
        className="sm:col-span-2 lg:col-span-12"
        bodyClassName="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5"
      >
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[0.72rem] text-foreground/80">
          {arc.map((stop, index) => (
            <li key={stop} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-ring/60">
                  →
                </span>
              ) : null}
              <span
                className={
                  index === arc.length - 1 ? "text-foreground" : undefined
                }
              >
                {stop}
              </span>
            </li>
          ))}
        </ol>
        <p className="shrink-0 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-hud-muted">
          {t("bento.transitSpan")}
        </p>
      </Tile>
    </>
  );

  // Reduced motion: render the grid statically. The StaggerItem tiles resolve
  // to their resting state (visible, untransformed) with no Stagger driver.
  const grid = reduced ? (
    <div className={gridClassName}>{tiles}</div>
  ) : (
    <Stagger as="div" className={gridClassName}>
      {tiles}
    </Stagger>
  );

  return (
    <div className="relative isolate">
      {/* Faint reactive dot-grid — keeps the dashboard alive, not flat.
          Self-pauses off-screen; renders one static frame under reduced motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-lg opacity-[0.18]"
      >
        <DotGrid spacing={30} baseOpacity={0.16} hoverOpacity={0.55} />
      </div>
      {grid}
    </div>
  );
}

/* ── Shared tile shell ─────────────────────────────────────────────────── */

function Tile({
  label,
  sub,
  ariaLabel,
  className,
  bodyClassName,
  children,
}: {
  label: string;
  sub?: string;
  ariaLabel: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <StaggerItem className={cn("min-w-0", className)}>
      <BentoTilt glare className="h-full rounded-lg">
        <article
          aria-label={ariaLabel}
          className={cn(
            "glass-surface glass-interactive group relative isolate flex h-full flex-col overflow-hidden rounded-lg p-4 sm:p-5",
            "transition-[border-color] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/40",
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-ring/40 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-2.5 size-2 border-r border-t border-hud-muted/40"
          />
          <header className="mb-3 flex items-baseline gap-2">
            <span className="font-pixel text-sm uppercase leading-none tracking-[0.08em] text-foreground/70">
              {label}
            </span>
            {sub ? (
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ring/70">
                {sub}
              </span>
            ) : null}
          </header>
          <div className={cn("flex-1", bodyClassName)}>{children}</div>
        </article>
      </BentoTilt>
    </StaggerItem>
  );
}
