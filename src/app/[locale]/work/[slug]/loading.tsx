import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for /work/[slug]. Header cartridge + meta ribbon +
// long-form case-study layout (problem / solution / role + stack).
export default function ProjectDetailLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <header className="relative overflow-hidden border-b">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonChip className="w-16" />
            <SkeletonChip className="w-12" />
            <SkeletonChip className="w-20" />
          </div>
          <div className="mt-6 grid gap-3">
            <SkeletonLine className="h-12 w-8/12 sm:h-16" />
            <SkeletonLine className="h-12 w-6/12 sm:h-16" />
          </div>
          <div className="mt-6 grid max-w-2xl gap-2">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-10/12" />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="aspect-[16/9] w-full rounded-lg" />
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_18rem] lg:px-8">
        <div className="grid gap-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid gap-3">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-6 w-7/12" />
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-10/12" />
              <SkeletonLine className="w-9/12" />
            </div>
          ))}
        </div>
        <aside className="grid gap-4">
          <SkeletonBlock className="h-32 rounded-lg" />
          <SkeletonBlock className="h-44 rounded-lg" />
        </aside>
      </section>
    </article>
  );
}
