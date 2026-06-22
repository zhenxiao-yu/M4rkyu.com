import { SkeletonHero, SkeletonLine } from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/terms`. Hero + the updated stamp, intro, and a
 * stack of numbered terms sections in the narrow reading column.
 */
export default function TermsLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <SkeletonLine className="h-3 w-48" />
          <div className="mt-5 grid gap-2">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-11/12" />
          </div>

          <div className="mt-10 flex flex-col gap-9">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid gap-3">
                <SkeletonLine className="h-5 w-6/12" />
                <div className="grid gap-2">
                  <SkeletonLine className="w-full" />
                  <SkeletonLine className="w-11/12" />
                  <SkeletonLine className="w-9/12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
