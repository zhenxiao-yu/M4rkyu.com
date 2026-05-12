import { cn } from "@/lib/utils";

/**
 * Tiny composable skeleton primitives used across `loading.tsx`
 * boundaries. All static Tailwind — no client JS, no `useEffect`s.
 * `animate-pulse` honours `prefers-reduced-motion: reduce` via
 * Tailwind v4 defaults.
 *
 * Naming follows the existing `loading.tsx` files
 * (logs/loading.tsx, contact/loading.tsx) so a new contributor sees
 * the same vocabulary in every skeleton.
 */

const PULSE = "animate-pulse [animation-duration:1.6s]";

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("h-3 rounded-sm bg-muted", PULSE, className)} />;
}

export function SkeletonChip({ className }: { className?: string }) {
  return <div className={cn("h-5 rounded-full bg-muted", PULSE, className)} />;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted", PULSE, className)} />;
}

/**
 * Hero band skeleton — matches the `relative overflow-hidden border-b`
 * with cyber-grid + vignette atmospheric layers used by every page's
 * top section. `rightSlot` covers the variant where the hero has a
 * side card (work, logs, games, media).
 */
export function SkeletonHero({
  atmosphereOpacity = "opacity-30",
  rightSlot,
}: {
  /** Opacity of the cyber-grid overlay (some pages use 25, 30, 35). */
  atmosphereOpacity?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b">
      <div
        className={cn("absolute inset-0 bg-cyber-grid", atmosphereOpacity)}
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div
        className={cn(
          "relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
          rightSlot && "grid gap-10 lg:grid-cols-[1fr_22rem]",
        )}
      >
        <div>
          <SkeletonLine className="h-2.5 w-32" />
          <div className="mt-6 space-y-3">
            <SkeletonLine className="h-8 w-full sm:h-10 sm:w-9/12" />
          </div>
          <div className="mt-6 space-y-2">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-10/12" />
          </div>
        </div>
        {rightSlot ? <div className="lg:pl-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}

/**
 * Generic responsive card grid skeleton. Defaults to the project's
 * standard `gap-5 md:grid-cols-2 lg:grid-cols-3` pattern. Each cell is
 * a thumbnail block + 3 lines + 2 chip slots — the common shape across
 * archive cards, project cartridges, game cards, resource cards.
 */
export function SkeletonGrid({
  count = 6,
  className = "grid gap-5 md:grid-cols-2 lg:grid-cols-3",
  withThumb = true,
}: {
  count?: number;
  className?: string;
  withThumb?: boolean;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 overflow-hidden rounded-lg border border-border/60 bg-card/80"
        >
          {withThumb ? <SkeletonBlock className="aspect-video w-full rounded-none" /> : null}
          <div className="grid gap-3 p-5">
            <div className="flex flex-wrap gap-2">
              <SkeletonChip className="w-16" />
              <SkeletonChip className="w-12" />
            </div>
            <SkeletonLine className="h-4 w-9/12" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-10/12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Right-side "archive status" card skeleton — matches the bordered
 * card used in work/games/media heroes (3 short stats + a disclaimer
 * line).
 */
export function SkeletonStatusCard() {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-background/70 p-5">
      <SkeletonLine className="h-4 w-3/12" />
      <SkeletonLine className="w-9/12" />
      <SkeletonLine className="w-10/12" />
      <SkeletonLine className="w-8/12" />
      <SkeletonLine className="w-11/12" />
    </div>
  );
}
