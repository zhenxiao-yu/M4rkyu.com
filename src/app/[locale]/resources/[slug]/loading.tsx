import {
  SkeletonBlock,
  SkeletonChip,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for /resources/[slug] (tool routes). Mirrors the
// back-link + ToolShell title + chip cluster + interactive surface so
// the layout doesn't shift when the tool chunk mounts.
export default function ToolLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SkeletonLine className="mb-8 h-3 w-32" />
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonChip className="w-14" />
            <SkeletonChip className="w-12" />
            <SkeletonChip className="w-16" />
          </div>
          <SkeletonLine className="h-9 w-7/12" />
          <SkeletonLine className="w-9/12" />
          <SkeletonLine className="w-7/12" />

          <div className="mt-4 rounded-lg border border-border/60 bg-card/60">
            <div className="border-b border-border/60 p-4">
              <SkeletonLine className="h-3 w-16" />
            </div>
            <div className="grid gap-4 p-6 sm:p-8">
              <SkeletonBlock className="h-44 w-full rounded-md" />
              <SkeletonLine className="w-10/12" />
              <SkeletonLine className="w-8/12" />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
