import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonGrid,
  SkeletonHero,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/resources/links`. Hero + featured bento
 * frame + tag pills + grid so the layout doesn't shift when the
 * explorer mounts.
 */
export default function ResourcesLinksLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-3 lg:auto-rows-[minmax(11rem,1fr)]">
          <div className="lg:col-span-2 lg:row-span-2">
            <SkeletonBlock className="h-full min-h-64 w-full rounded-lg" />
          </div>
          <div className="grid gap-3 lg:row-start-2 lg:row-span-2">
            <SkeletonBlock className="h-32 w-full rounded-lg" />
            <SkeletonBlock className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonChip className="w-12" />
          <SkeletonChip className="w-20" />
          <SkeletonChip className="w-16" />
          <SkeletonChip className="w-24" />
          <SkeletonChip className="w-14" />
        </div>
        <div className="mt-4">
          <SkeletonBlock className="h-10 w-full" />
        </div>
        <div className="mt-8">
          <SkeletonGrid
            count={9}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            withThumb={false}
          />
        </div>
      </section>
    </article>
  );
}
