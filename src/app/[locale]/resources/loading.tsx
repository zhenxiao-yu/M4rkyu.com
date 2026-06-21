import {
  SkeletonBlock,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/resources` (landing splash). Two large
 * entry tiles for Tools and Links — keep the skeleton aligned so the
 * layout doesn't shift when the page mounts.
 */
export default function ResourcesLandingLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="grid h-80 gap-4 rounded-lg border border-border/60 bg-card/40 p-6 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <SkeletonBlock className="size-12 rounded-md" />
                <SkeletonLine className="h-3 w-20" />
              </div>
              <div className="grid gap-2">
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-8 w-2/3" />
                <SkeletonLine className="w-11/12" />
                <SkeletonLine className="w-9/12" />
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5">
                <SkeletonLine className="h-6 w-24 rounded-full" />
                <SkeletonLine className="h-6 w-28 rounded-full" />
                <SkeletonLine className="h-6 w-20 rounded-full" />
                <SkeletonLine className="h-6 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
