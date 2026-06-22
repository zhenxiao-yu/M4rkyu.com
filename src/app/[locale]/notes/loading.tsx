import {
  SkeletonChip,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/notes`. Hero + the centred tag filter and a stack
 * of timeline note cards.
 */
export default function NotesLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-8">
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {["w-16", "w-20", "w-14", "w-24", "w-16", "w-20", "w-12", "w-24"].map(
              (width, index) => (
                <SkeletonChip key={index} className={`h-7 ${width} rounded-full`} />
              ),
            )}
          </div>
          <div className="mx-auto grid w-full max-w-3xl gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-border/60 bg-card/60 p-5"
              >
                <div className="flex items-center gap-3">
                  <SkeletonChip className="w-16" />
                  <SkeletonLine className="h-3 w-24" />
                </div>
                <SkeletonLine className="h-4 w-9/12" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-10/12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
