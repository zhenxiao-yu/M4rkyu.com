import {
  SkeletonGrid,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Matches the live product grid column rhythm so cards don't reflow on mount.
const PRODUCT_GRID = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4";

/**
 * Suspense fallback for `/shop`. Hero + the featured band and the paginated
 * product catalogue.
 */
export default function ShopLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="bg-linear-to-b from-transparent via-muted/15 to-transparent">
        <div className="mx-auto w-full max-w-page px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-3">
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="h-7 w-64" />
          </div>
          <div className="mt-8">
            <SkeletonGrid count={3} className={PRODUCT_GRID} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-3">
          <SkeletonLine className="h-3 w-28" />
          <SkeletonLine className="h-7 w-72" />
          <SkeletonLine className="w-10/12" />
        </div>
        <div className="mt-8">
          <SkeletonGrid count={6} className={PRODUCT_GRID} />
        </div>
      </section>
    </article>
  );
}
