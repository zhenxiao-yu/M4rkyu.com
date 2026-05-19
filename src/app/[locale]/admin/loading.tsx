import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for every /admin/* route. Admin pages are
// `force-dynamic` so they pay the round-trip cost on first nav;
// this skeleton fills the gap so the page doesn't feel frozen.
export default function AdminLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-20" />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Admin nav strip */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-2">
          <SkeletonChip className="w-20" />
          <SkeletonChip className="w-16" />
          <SkeletonChip className="w-20" />
          <SkeletonChip className="w-20" />
          <SkeletonChip className="w-14" />
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonBlock className="h-9 w-32 rounded-md" />
        </div>

        <SkeletonGrid count={6} withThumb={false} />
      </section>
    </article>
  );
}
