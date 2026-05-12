import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/portal`. The live page is a two-column hero
 * (CTAs on the left, terminal-shell card on the right) with cyber-grid
 * + noise + scanline atmospheric layers.
 */
export default function PortalLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <section className="relative min-h-[78dvh] overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-45" aria-hidden="true" />
        <div className="noise-layer absolute inset-0" aria-hidden="true" />
        <div className="scanline-layer absolute inset-0 opacity-35" aria-hidden="true" />

        <div className="relative mx-auto grid min-h-[78dvh] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <SkeletonLine className="h-2.5 w-24" />
            <div className="mt-6 space-y-3">
              <SkeletonLine className="h-12 w-full sm:h-16 sm:w-9/12" />
              <SkeletonLine className="h-12 w-9/12 sm:h-16 sm:w-7/12" />
            </div>
            <div className="mt-6 space-y-2">
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-10/12" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <SkeletonBlock className="h-10 w-32" />
              <SkeletonBlock className="h-10 w-24" />
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-border/60 bg-background/80 p-5 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="size-10" />
                <div className="grid gap-2">
                  <SkeletonLine className="h-3 w-32" />
                  <SkeletonLine className="h-2.5 w-24" />
                </div>
              </div>
              <SkeletonChip className="w-16" />
            </div>
            <div className="grid gap-2 border-t border-border/60 pt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonLine key={index} className="w-9/12" />
              ))}
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
