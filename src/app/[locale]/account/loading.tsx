import {
  SkeletonBlock,
  SkeletonHero,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for /account/*. PageHero + side nav + content card.
export default function AccountLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <SkeletonHero atmosphereOpacity="opacity-20" />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_1fr] lg:px-8">
        <aside className="grid gap-2">
          <SkeletonBlock className="h-10 rounded-md" />
          <SkeletonBlock className="h-10 rounded-md" />
          <SkeletonBlock className="h-10 rounded-md" />
          <SkeletonBlock className="h-10 rounded-md" />
        </aside>
        <div className="grid gap-5 rounded-lg border border-border/60 bg-card/60 p-6">
          <SkeletonLine className="h-5 w-4/12" />
          <SkeletonLine className="w-10/12" />
          <SkeletonLine className="w-8/12" />
          <SkeletonBlock className="mt-2 h-32 rounded-md" />
        </div>
      </section>
    </article>
  );
}
