import {
  SkeletonGrid,
  SkeletonHero,
  SkeletonStatusCard,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/games`. Hero (with right-side archive-status
 * card) + 3-up grid of game cartridges.
 */
export default function GamesLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-35" rightSlot={<SkeletonStatusCard />} />
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SkeletonGrid count={6} />
      </section>
    </article>
  );
}
