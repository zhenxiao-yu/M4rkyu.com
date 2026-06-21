import { SkeletonBlock, SkeletonLine } from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/about`. Mirrors the live dossier layout: a tall
 * subject band followed by a stack of labelled field panels.
 */
export default function AboutLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <section className="mx-auto grid w-full max-w-page gap-7 px-4 py-10 sm:gap-9 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {/* Subject band */}
        <div className="grid gap-6 rounded-lg border border-border/60 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-3">
            <SkeletonLine className="h-3 w-40" />
            <SkeletonLine className="h-3 w-28" />
          </div>
          <SkeletonLine className="h-16 w-8/12 sm:h-24" />
          <SkeletonLine className="h-3 w-56" />
          <SkeletonLine className="h-3 w-72" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-28" />
            <SkeletonBlock className="h-9 w-24" />
          </div>
        </div>

        {/* Field panels */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid gap-3.5">
            <div className="flex items-center gap-3">
              <SkeletonLine className="h-4 w-44" />
              <span className="h-px flex-1 bg-border/60" aria-hidden="true" />
            </div>
            <SkeletonBlock className="h-40 w-full" />
          </div>
        ))}
      </section>
    </article>
  );
}
