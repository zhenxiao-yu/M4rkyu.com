import {
  SkeletonBlock,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for /account/*. Mirrors the real layout: PageHero,
// the top tab bar, the identity credential panel, then the quick-link rows.
export default function AccountLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-20" />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Top tab nav */}
        <div className="mb-8 flex gap-2 border-b border-border pb-3">
          <SkeletonBlock className="h-7 w-20 rounded-md" />
          <SkeletonBlock className="h-7 w-16 rounded-md" />
          <SkeletonBlock className="h-7 w-20 rounded-md" />
          <SkeletonBlock className="h-7 w-16 rounded-md" />
        </div>

        <div className="grid gap-12">
          {/* Identity credential panel */}
          <div className="grid gap-6 rounded-[1.25rem] border border-border/60 bg-card/60 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <SkeletonBlock className="size-14 rounded-full sm:size-16" />
              <div className="grid gap-2">
                <SkeletonLine className="h-5 w-40" />
                <SkeletonLine className="w-28" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 border-t border-border/60 pt-6 sm:grid-cols-4">
              <SkeletonLine className="w-20" />
              <SkeletonLine className="w-16" />
              <SkeletonLine className="w-16" />
              <SkeletonLine className="w-24" />
            </div>
            <SkeletonLine className="w-9/12" />
          </div>

          {/* Quick-link rows */}
          <div className="grid gap-1">
            <SkeletonBlock className="mb-2 h-10 rounded-md" />
            <SkeletonBlock className="h-14 rounded-md" />
            <SkeletonBlock className="h-14 rounded-md" />
            <SkeletonBlock className="h-14 rounded-md" />
          </div>
        </div>
      </section>
    </article>
  );
}
