import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/colophon`. Hero + the stack-card grid (six tech
 * modules) and the changelog CTA panel.
 */
export default function ColophonLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-5 rounded-lg border border-border/60 bg-card/60 p-5"
            >
              <div className="flex items-center justify-between">
                <SkeletonBlock className="size-11 rounded-md" />
                <SkeletonLine className="h-3 w-6" />
              </div>
              <div className="grid gap-2">
                <SkeletonLine className="h-5 w-7/12" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-10/12" />
              </div>
              <div className="flex flex-wrap gap-2">
                <SkeletonChip className="w-16" />
                <SkeletonChip className="w-12" />
                <SkeletonChip className="w-14" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 rounded-lg border border-border/60 bg-card/60 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div className="grid gap-2">
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="h-7 w-7/12" />
            <SkeletonLine className="w-10/12" />
          </div>
          <SkeletonBlock className="h-9 w-40 rounded-full" />
        </div>
      </section>
    </article>
  );
}
