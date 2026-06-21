import {
  SkeletonChip,
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/archive`. Mirrors the live layout: hero,
 * collection badge row, 3-up collection grid, then the lightbox
 * media grid section.
 */
export default function ArchiveLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-35" />

      <section className="mx-auto w-full max-w-page px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonChip key={index} className="w-24" />
          ))}
        </div>
        <div className="mt-8">
          <SkeletonGrid count={3} className="grid gap-5 md:grid-cols-3 3xl:grid-cols-4" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-4 pb-20 sm:px-6 lg:px-8">
        <SkeletonLine className="h-2.5 w-24" />
        <div className="mt-3 space-y-2">
          <SkeletonLine className="h-6 w-4/12 sm:h-7" />
          <SkeletonLine className="w-8/12" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-2 overflow-hidden rounded-md border border-border/60 bg-card/80"
            >
              <div className="aspect-4/5 skeleton-shimmer" />
              <div className="grid gap-2 p-3">
                <SkeletonChip className="w-12" />
                <SkeletonLine className="h-4 w-9/12" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
