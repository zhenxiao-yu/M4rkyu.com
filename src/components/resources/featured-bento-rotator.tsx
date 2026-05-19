"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import {
  BentoRotatorShell,
  type BentoRotatorLabels,
} from "@/components/ui/magic/bento-rotator-shell";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";
import { ToolIcon } from "./tool-icon";

// Heavy: pulls OGL + an inline SVG texture. SSR off so the canvas
// only mounts once we know we have a fine pointer + motion permission.
const GridDistortion = dynamic(
  () =>
    import("@/components/ui/magic/grid-distortion").then((mod) => ({
      default: mod.GridDistortion,
    })),
  { ssr: false },
);

export interface BentoItem {
  /** Stable identifier — also the React key. */
  id: string;
  name: string;
  description: string;
  /** Absolute or locale-relative href. External items pass `external: true`. */
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /** Optional lucide iconKey resolved by ToolIcon. */
  iconKey?: string;
  /** Optional tags — shown as Badge fragments. */
  tags?: string[];
  /** Optional one-word category. */
  category?: string;
}

interface FeaturedBentoRotatorProps {
  items: BentoItem[];
  locale: Locale;
  labels: BentoRotatorLabels & {
    /** Template `"Open {name}"`. */
    openAria: string;
    /** Short corner badge label ("Tool", "Link"). */
    typeBadge: string;
  };
  /** Desktop interval (ms). Defaults to 8000. */
  intervalMs?: number;
  /** Mobile interval (ms). Defaults to 10000. */
  mobileIntervalMs?: number;
  /** Storage key for the collapse preference. */
  collapseStorageKey?: string;
}

const PAGE_SIZE = 7;
const DEFAULT_COLLAPSE_KEY = "m4rkyu:resources:bento-collapsed";
const HIGHLIGHT_MS = 1500;

/**
 * Mosaic spotlight bento for `/resources/tools` and `/resources/links`.
 * Seven items per page laid out in an editorial 4×3 grid (1 hero + 6
 * supporting). Auto-rotates on a clock, pauses on hover / tab hidden
 * / reduced motion / collapse.
 */
export function FeaturedBentoRotator({
  items,
  locale,
  labels,
  intervalMs,
  mobileIntervalMs,
  collapseStorageKey = DEFAULT_COLLAPSE_KEY,
}: FeaturedBentoRotatorProps) {
  return (
    <BentoRotatorShell
      items={items}
      pageSize={PAGE_SIZE}
      getItemKey={(item) => item.id}
      labels={labels}
      intervalMs={intervalMs}
      mobileIntervalMs={mobileIntervalMs}
      collapseStorageKey={collapseStorageKey}
      renderBackdrop={() => (
        // Ambient grid-distortion canvas. Sits behind the tiles and
        // unmounts (via the consumer's reduce-motion / pointer gate)
        // on touch + reduced-motion. mix-blend-screen keeps the warp
        // legible on both light and dark themes.
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 overflow-hidden rounded-lg opacity-30 mix-blend-screen dark:opacity-25 dark:mix-blend-plus-lighter"
        >
          <GridDistortion mouse={0.1} strength={0.15} grid={15} />
        </div>
      )}
      renderPage={(pageItems, pageIndex) => {
        const isStatic = items.length <= PAGE_SIZE;
        const visible = pageItems.slice(0, PAGE_SIZE);
        const [hero, t2, t3, t4, t5, t6, t7] = visible;
        return (
          <MosaicGrid>
            {hero ? (
              <BentoHeroTile
                key={`hero-${pageIndex}-${hero.id}`}
                item={hero}
                locale={locale}
                openAriaTemplate={labels.openAria}
                typeBadge={labels.typeBadge}
                highlight={!isStatic}
              />
            ) : null}
            {t2 ? (
              <BentoSecondaryTile
                key={`t2-${pageIndex}-${t2.id}`}
                item={t2}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t3 ? (
              <BentoSecondaryTile
                key={`t3-${pageIndex}-${t3.id}`}
                item={t3}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t4 ? (
              <BentoWideTile
                key={`t4-${pageIndex}-${t4.id}`}
                item={t4}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-2 lg:col-span-2 lg:row-span-1"
              />
            ) : null}
            {t5 ? (
              <BentoSecondaryTile
                key={`t5-${pageIndex}-${t5.id}`}
                item={t5}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t6 ? (
              <BentoSecondaryTile
                key={`t6-${pageIndex}-${t6.id}`}
                item={t6}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-1 lg:col-span-1 lg:row-span-1"
              />
            ) : null}
            {t7 ? (
              <BentoWideTile
                key={`t7-${pageIndex}-${t7.id}`}
                item={t7}
                locale={locale}
                openAriaTemplate={labels.openAria}
                spanClass="md:col-span-2 lg:col-span-2 lg:row-span-1"
              />
            ) : null}
          </MosaicGrid>
        );
      }}
    />
  );
}

function MosaicGrid({ children }: { children: React.ReactNode }) {
  // Three layouts, one source order:
  //   - Mobile (default): single column with vertical scroll-snap,
  //     so the rotator reads like a polished carousel even when the
  //     viewport can't show the full grid at once.
  //   - Tablet (md): 2 cols, hero spans both, wide tiles span both,
  //     secondary tiles take a single column.
  //   - Desktop (lg+): 4 cols × 3 rows, hero `col-span-2 row-span-2`
  //     sits left, two 1×1 + one 2×1 stack right, then a 1×1 + 1×1 +
  //     2×1 ribbon at the bottom. Every cell is occupied.
  return (
    <div
      className={cn(
        "grid gap-3",
        "snap-y snap-mandatory max-h-[80vh] overflow-y-auto md:overflow-visible md:max-h-none md:snap-none",
        "md:grid-cols-2 md:auto-rows-[minmax(10rem,1fr)]",
        "lg:grid-cols-4 lg:auto-rows-[minmax(9.5rem,1fr)]",
      )}
    >
      {children}
    </div>
  );
}

function BentoHeroTile({
  item,
  locale,
  openAriaTemplate,
  typeBadge,
  highlight,
}: {
  item: BentoItem;
  locale: Locale;
  openAriaTemplate: string;
  typeBadge: string;
  highlight: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ariaLabel = openAriaTemplate.replace("{name}", item.name);
  // Initial beam state comes from the props directly — the parent
  // keys this tile by pageIndex so a rotation remounts the component
  // and `useState(initial)` re-evaluates with the fresh prop. The
  // effect then only needs to fire the off-timer (the React 19
  // `react-hooks/set-state-in-effect` rule allows setState inside
  // setTimeout callbacks, just not in the effect body).
  const initialBeam = highlight && !reduceMotion;
  const [showBeam, setShowBeam] = useState(initialBeam);
  useEffect(() => {
    if (!initialBeam) return;
    const id = window.setTimeout(() => setShowBeam(false), HIGHLIGHT_MS);
    return () => window.clearTimeout(id);
  }, [initialBeam]);

  // Stat row sits above the open arrow. Shows source domain for
  // external items, "instant · no upload" for internal tools — both
  // keep short-description tiles from feeling thin.
  const statRow = item.external
    ? safeDomain(item.href)
    : "instant · no upload";

  const content = (
    <>
      <PointerSpotlight radius={520} intensity={0.22} />
      {showBeam ? <BorderBeam borderRadius={8} duration={3} /> : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cyber-grid opacity-25"
      />
      <div className="relative z-20 flex shrink-0 items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-md border border-ring/40 bg-background/60 text-ring">
          <ToolIcon
            iconKey={item.iconKey}
            tags={item.tags}
            className="size-6"
          />
        </span>
        <Badge
          variant="success"
          className="gap-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
        >
          {typeBadge}
        </Badge>
      </div>

      <h3 className="relative z-20 shrink-0 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
        {item.name}
      </h3>

      {/* Description owns the slack so short copy doesn't leave a
          vertical void. line-clamp keeps the tile predictable when
          the source description is unusually long. */}
      <p className="relative z-20 flex-1 max-w-prose text-sm leading-6 text-muted-foreground line-clamp-6 md:line-clamp-none sm:text-base sm:leading-7">
        {item.description}
      </p>

      {item.tags && item.tags.length > 0 ? (
        <div className="relative z-20 flex shrink-0 flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="font-mono text-[0.55rem]"
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
          {statRow}
        </span>
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            open
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
          />
        </span>
      </div>
    </>
  );

  const className = cn(
    "group relative isolate flex h-full min-h-[18rem] flex-col gap-4 overflow-hidden rounded-lg border border-border bg-card/80 p-6 transition-[border-color] duration-(--motion-fast) ease-(--ease-premium)",
    "snap-start scroll-mt-4",
    "md:col-span-2 md:min-h-[22rem]",
    "lg:col-span-2 lg:row-span-2",
    "hover:border-ring/70",
    FOCUS_RING,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
        data-bento-tile
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      locale={locale}
      aria-label={ariaLabel}
      className={className}
      data-bento-tile
    >
      {content}
    </Link>
  );
}

function BentoSecondaryTile({
  item,
  locale,
  openAriaTemplate,
  spanClass,
}: {
  item: BentoItem;
  locale: Locale;
  openAriaTemplate: string;
  spanClass?: string;
}) {
  const ariaLabel = openAriaTemplate.replace("{name}", item.name);

  const content = (
    <>
      <PointerSpotlight radius={300} intensity={0.18} />
      <div className="relative z-20 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border/70 bg-background/60 text-ring transition-[border-color] duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/70">
          <ToolIcon
            iconKey={item.iconKey}
            tags={item.tags}
            className="size-4.5"
          />
        </span>
        <div className="min-w-0 grid gap-0.5">
          <h3 className="truncate text-sm font-semibold leading-tight">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
      <ArrowUpRight
        aria-hidden="true"
        className="relative z-20 size-4 self-end text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
      />
    </>
  );

  const className = cn(
    "group relative isolate flex h-full min-h-[9rem] flex-col justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
    "snap-start scroll-mt-4",
    "hover:border-ring/60 motion-safe:hover:-translate-y-0.5",
    FOCUS_RING,
    spanClass,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
        data-bento-tile
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      locale={locale}
      aria-label={ariaLabel}
      className={className}
      data-bento-tile
    >
      {content}
    </Link>
  );
}

function BentoWideTile({
  item,
  locale,
  openAriaTemplate,
  spanClass,
}: {
  item: BentoItem;
  locale: Locale;
  openAriaTemplate: string;
  spanClass?: string;
}) {
  const ariaLabel = openAriaTemplate.replace("{name}", item.name);

  // 2-col tiles get a longer excerpt + tag row so they earn the
  // extra width. Same hover ramp as the 1×1 secondary, same focus
  // ring.
  const content = (
    <>
      <PointerSpotlight radius={380} intensity={0.2} />
      <div className="relative z-20 flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border/70 bg-background/60 text-ring transition-[border-color] duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/70">
            <ToolIcon
              iconKey={item.iconKey}
              tags={item.tags}
              className="size-5"
            />
          </span>
          <div className="min-w-0 grid gap-1">
            <h3 className="truncate text-base font-semibold leading-tight">
              {item.name}
            </h3>
            <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          {item.tags && item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="font-mono text-[0.5rem]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <span />
          )}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
          />
        </div>
      </div>
    </>
  );

  const className = cn(
    "group relative isolate flex h-full min-h-[9rem] overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
    "snap-start scroll-mt-4",
    "hover:border-ring/60 motion-safe:hover:-translate-y-0.5",
    FOCUS_RING,
    spanClass,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
        data-bento-tile
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      locale={locale}
      aria-label={ariaLabel}
      className={className}
      data-bento-tile
    >
      {content}
    </Link>
  );
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "external";
  }
}
