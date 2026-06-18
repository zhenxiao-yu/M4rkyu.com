import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for /games/[slug]. Same shape as /work/[slug] — a
// chip-led hero, hero media block, then long-form sections.
export default function GameDetailLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <header className="relative overflow-hidden border-b">
        <div className="mx-auto w-full max-w-page px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonChip className="w-12" />
            <SkeletonChip className="w-16" />
            <SkeletonChip className="w-14" />
          </div>
          <SkeletonLine className="mt-6 h-12 w-9/12 sm:h-16" />
          <SkeletonLine className="mt-3 h-12 w-6/12 sm:h-16" />
          <div className="mt-6 grid max-w-2xl gap-2">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-10/12" />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="aspect-[16/9] w-full rounded-lg" />
      </section>
    </article>
  );
}
