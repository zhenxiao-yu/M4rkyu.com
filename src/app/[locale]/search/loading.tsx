import {
  SkeletonBlock,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/search`. Hero + the search field and a column of
 * result rows while the static catalog and client query hydrate.
 */
export default function SearchLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6">
          <SkeletonBlock className="h-12 w-full rounded-md" />
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-lg border border-border/60 bg-card/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <SkeletonLine className="h-3 w-14" />
                  <SkeletonLine className="h-4 w-6/12" />
                </div>
                <SkeletonLine className="w-10/12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
