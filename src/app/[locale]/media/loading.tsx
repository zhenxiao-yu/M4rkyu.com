import {
  SkeletonBlock,
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/media`. Hero (with right-side featured video
 * placeholder), then a 2-up media item grid, then the poster system
 * section.
 */
export default function MediaLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero
        atmosphereOpacity="opacity-30"
        rightSlot={<SkeletonBlock className="aspect-video w-full" />}
      />

      <section className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonGrid count={4} className="grid gap-5 md:grid-cols-2" />
      </section>

      <section className="mx-auto w-full max-w-page px-4 pb-20 sm:px-6 lg:px-8">
        <SkeletonLine className="h-2.5 w-24" />
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="aspect-3/4 w-full" />
          ))}
        </div>
      </section>
    </article>
  );
}
