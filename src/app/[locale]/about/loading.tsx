import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/about`. Mirrors the live layout: hero band
 * with a right-side portrait/card slot, then a two-column bio +
 * timeline section.
 */
export default function AboutLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero
        atmosphereOpacity="opacity-30"
        rightSlot={<SkeletonBlock className="aspect-4/5 w-full" />}
      />

      <section className="mx-auto grid w-full max-w-page gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="grid gap-3">
          <SkeletonLine className="h-2.5 w-24" />
          <SkeletonLine className="h-5 w-6/12" />
          <div className="mt-4 grid gap-2">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-11/12" />
            <SkeletonLine className="w-10/12" />
            <SkeletonLine className="w-9/12" />
          </div>
        </div>
        <ol className="grid gap-6 border-l border-border/60 pl-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonChip className="w-16" />
                <SkeletonLine className="h-3 w-24" />
              </div>
              <SkeletonLine className="h-4 w-7/12" />
              <SkeletonLine className="w-10/12" />
              <SkeletonLine className="w-9/12" />
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
