import {
  SkeletonBlock,
  SkeletonLine,
} from "@/components/placeholders/skeleton";

// Suspense fallback for every /admin/* route. Rendered inside the admin
// shell (the rail/topbar persist), so this only fills the content column:
// a header block plus a shape-neutral stack that reads as list rows or
// form sections alike.
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="mb-8 border-b border-border/60 pb-6">
        <SkeletonLine className="h-3 w-20" />
        <SkeletonBlock className="mt-2 h-8 w-52 rounded-md" />
        <SkeletonLine className="mt-3 h-3 w-72" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-rise grid gap-3 rounded-lg border border-border/60 bg-card/40 p-5"
            style={{ animationDelay: `${i * 60}ms` }}
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
    </div>
  );
}
