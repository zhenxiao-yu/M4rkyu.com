import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for every /admin/* route. Admin pages are
// `force-dynamic` so they pay the round-trip cost on first nav; this
// skeleton fills the gap. Shape-neutral on purpose — the stacked
// section blocks read correctly whether the route resolves to a list
// (rows) or an editor (form sections), so a single fallback serves the
// whole subtree without a wrong-shaped flash.
export default function AdminLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-20" />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Admin nav strip — single non-wrapping command bar */}
        <div className="mb-8 flex items-center gap-1 overflow-hidden border-b border-border pb-2">
          <SkeletonChip className="h-9 w-24 rounded-md" />
          <SkeletonChip className="h-9 w-20 rounded-md" />
          <SkeletonChip className="h-9 w-20 rounded-md" />
          <SkeletonChip className="h-9 w-24 rounded-md" />
          <SkeletonChip className="h-9 w-20 rounded-md" />
          <SkeletonChip className="ml-auto h-9 w-24 rounded-md" />
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonBlock className="h-9 w-32 rounded-md" />
        </div>

        {/* Neutral content body — three panels, each a heading line plus a
          * couple of full-width blocks. Equally plausible as list rows or
          * form sections. */}
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border border-border/60 bg-card/40 p-5"
            >
              <SkeletonLine className="h-3 w-28" />
              <div className="grid gap-3 sm:grid-cols-2">
                <SkeletonBlock className="h-9 rounded-md" />
                <SkeletonBlock className="h-9 rounded-md" />
              </div>
              <SkeletonBlock className="h-16 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
