import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
  SkeletonStatusCard,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/work`. Hero (with right-side archive-status
 * card) + filter toolbar + 3-up project cartridge grid.
 */
export default function WorkLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-35" rightSlot={<SkeletonStatusCard />} />

      <section className="mx-auto w-full max-w-page px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonChip className="w-12" />
            <SkeletonChip className="w-16" />
            <SkeletonChip className="w-20" />
            <SkeletonChip className="w-16" />
            <SkeletonChip className="w-14" />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
            <SkeletonBlock className="h-10 w-full lg:w-40" />
            <SkeletonLine className="h-3 w-16" />
          </div>
        </div>

        <div className="mt-8">
          <SkeletonGrid
            count={6}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4"
          />
        </div>
      </section>
    </article>
  );
}
