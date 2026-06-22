import {
  SkeletonBlock,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/changelog`. Hero + the live-pulse eyebrow and a
 * glass card of changelog prose, in the narrow reading column.
 */
export default function ChangelogLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mb-5 flex items-center gap-3">
          <SkeletonBlock className="size-2 rounded-full" />
          <SkeletonLine className="h-3 w-28" />
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
        <div className="grid gap-5 rounded-lg border border-border/60 bg-card/60 p-5 sm:p-7">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="grid gap-2.5">
              <SkeletonLine className="h-5 w-40" />
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-11/12" />
              <SkeletonLine className="w-9/12" />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
