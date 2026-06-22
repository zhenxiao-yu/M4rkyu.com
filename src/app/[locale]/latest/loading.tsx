import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/latest`. Hero + a stacked feed of cross-content
 * rows (badge · date · title/excerpt · arrow), mirroring the live aggregator
 * so the layout doesn't shift when the page mounts.
 */
export default function LatestLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-2.5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid items-start gap-4 rounded-lg border border-border/60 bg-card/60 p-4 sm:grid-cols-[2.5rem_8rem_1fr_auto] sm:gap-5 sm:p-5"
            >
              <SkeletonLine className="hidden h-4 w-6 sm:block" />
              <div className="grid gap-2">
                <SkeletonChip className="w-16" />
                <SkeletonLine className="h-3 w-20" />
              </div>
              <div className="grid gap-2">
                <SkeletonLine className="h-4 w-8/12" />
                <SkeletonLine className="w-full" />
                <div className="flex flex-wrap gap-2">
                  <SkeletonLine className="h-3 w-10" />
                  <SkeletonLine className="h-3 w-12" />
                  <SkeletonLine className="h-3 w-8" />
                </div>
              </div>
              <SkeletonBlock className="hidden size-4 rounded-sm sm:block" />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
