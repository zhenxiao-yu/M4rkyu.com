import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/resources`. Hero + category-filter row +
 * 3-up grid + the "index pending" empty state at the bottom.
 */
export default function ResourcesLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonChip className="w-12" />
            <SkeletonChip className="w-20" />
            <SkeletonChip className="w-16" />
            <SkeletonChip className="w-24" />
            <SkeletonChip className="w-14" />
            <SkeletonLine className="ml-2 h-2.5 w-16" />
          </div>
          <div className="grid gap-2">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </div>

        <div className="mt-8">
          <SkeletonGrid count={6} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" withThumb={false} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-md border border-dashed border-border/60 bg-muted/30 p-8 text-center">
          <SkeletonBlock className="mx-auto size-9 rounded-full" />
          <SkeletonLine className="mx-auto h-4 w-4/12" />
          <SkeletonLine className="mx-auto w-6/12" />
        </div>
      </section>
    </article>
  );
}
