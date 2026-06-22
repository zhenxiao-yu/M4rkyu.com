import { SkeletonBlock, SkeletonHero } from "@/components/placeholders/skeleton";

// Varied widths so the placeholder cloud reads like real topic labels of
// different lengths rather than a uniform grid.
const PILL_WIDTHS = [
  "w-24",
  "w-32",
  "w-20",
  "w-28",
  "w-36",
  "w-24",
  "w-20",
  "w-40",
  "w-28",
  "w-24",
  "w-32",
  "w-20",
  "w-36",
  "w-28",
  "w-24",
  "w-32",
];

/**
 * Suspense fallback for `/topics`. Hero + a wrapping cloud of topic pills.
 */
export default function TopicsLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-25" />

      <section className="mx-auto w-full max-w-page px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-wrap gap-2">
          {PILL_WIDTHS.map((width, index) => (
            <SkeletonBlock key={index} className={`h-9 ${width} rounded-full`} />
          ))}
        </div>
      </section>
    </article>
  );
}
