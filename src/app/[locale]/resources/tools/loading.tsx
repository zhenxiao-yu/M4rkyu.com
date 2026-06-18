import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/resources/tools`. Hero + featured bento
 * frame + filter row + tag-section grid so the layout doesn't shift
 * when the explorer mounts.
 */
export default function ResourcesToolsLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 pt-10 sm:px-6 lg:px-8">
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

      <section className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 lg:px-8">
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
          <SkeletonGrid
            count={6}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            withThumb={false}
          />
        </div>
      </section>
    </article>
  );
}
