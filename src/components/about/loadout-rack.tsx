"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  BentoRotatorShell,
  type BentoRotatorLabels,
} from "@/components/ui/magic/bento-rotator-shell";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { cn, PANEL_TILE } from "@/lib/utils";

export interface RackGroup {
  /** Stable key (the raw group name). */
  key: string;
  /** Translated group label, e.g. "Code". */
  label: string;
  items: { label: string }[];
}

const HIGHLIGHT_MS = 1500;

/**
 * The heavy "magic-UI rack" for the about bento — Mark's stack rotating one
 * domain at a time through the shared {@link BentoRotatorShell} (auto-advance,
 * pause / dots / prev-next / collapse, reduced-motion + tab-hidden safe). Each
 * page is a wide tile: the domain name + count on the left, its chips on the
 * right, lit by a BorderBeam pulse on entry and a pointer spotlight.
 */
export function LoadoutRack({ groups }: { groups: RackGroup[] }) {
  const t = useTranslations("About.bento.rack");
  const labels: BentoRotatorLabels = {
    eyebrow: t("eyebrow"),
    heading: t("heading"),
    regionLabel: t("regionLabel"),
    prev: t("prev"),
    next: t("next"),
    pause: t("pause"),
    play: t("play"),
    collapse: t("collapse"),
    expand: t("expand"),
    gotoPage: t.raw("gotoPage") as string,
  };
  const systemsLabel = t("systems");

  return (
    <BentoRotatorShell
      items={groups}
      pageSize={1}
      getItemKey={(group) => group.key}
      labels={labels}
      intervalMs={5200}
      collapseStorageKey="m4rkyu:about:loadout-collapsed"
      renderPage={(pageItems, pageIndex) => {
        const group = pageItems[0];
        if (!group) return null;
        return (
          <RackPage
            key={`${pageIndex}-${group.key}`}
            group={group}
            systemsLabel={systemsLabel}
            highlight={groups.length > 1}
          />
        );
      }}
    />
  );
}

function RackPage({
  group,
  systemsLabel,
  highlight,
}: {
  group: RackGroup;
  systemsLabel: string;
  highlight: boolean;
}) {
  const reduced = useReducedMotion();
  // The parent keys this by pageIndex, so a rotation remounts it and the beam
  // re-fires. setState lives inside the timeout callback (allowed by the
  // react-hooks/set-state-in-effect rule), not the effect body.
  const initialBeam = highlight && !reduced;
  const [beam, setBeam] = useState(initialBeam);
  useEffect(() => {
    if (!initialBeam) return;
    const id = window.setTimeout(() => setBeam(false), HIGHLIGHT_MS);
    return () => window.clearTimeout(id);
  }, [initialBeam]);

  return (
    <div className="group relative isolate overflow-hidden rounded-lg border border-border bg-card/80 p-5 sm:p-6">
      <PointerSpotlight radius={460} intensity={0.2} />
      {beam ? <BorderBeam borderRadius={8} duration={3} /> : null}
      <div aria-hidden="true" className="absolute inset-0 bg-cyber-grid opacity-20" />

      <div className="relative z-10 grid gap-4 sm:grid-cols-[clamp(8rem,24%,12rem)_1fr] sm:items-center sm:gap-6">
        <div className="flex items-baseline gap-3 sm:flex-col sm:items-start sm:gap-1">
          <h3 className="font-display text-2xl font-semibold leading-none tracking-tight sm:text-4xl">
            {group.label}
          </h3>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="tabular-nums text-ring">
              {String(group.items.length).padStart(2, "0")}
            </span>{" "}
            {systemsLabel}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {group.items.map((skill) => (
            <li
              key={skill.label}
              className={cn(
                PANEL_TILE,
                "px-2.5 py-1 font-mono text-xs leading-5 text-foreground/85 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
              )}
            >
              {skill.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
