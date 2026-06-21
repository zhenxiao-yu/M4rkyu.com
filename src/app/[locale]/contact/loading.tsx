/**
 * Skeleton shown while the `/contact` server components stream in.
 * Matches the live composition: hero band + two-column layout
 * (services list + inquiry card). Rides the shared `skeleton-shimmer`
 * utility (globals.css) — token-driven, reduced-motion-safe.
 */
export default function ContactLoading() {
  const lineBase = "h-3 rounded-sm skeleton-shimmer";
  const chipBase = "h-5 rounded-full skeleton-shimmer";
  const blockBase = "rounded-md skeleton-shimmer";

  return (
    <article aria-busy="true" aria-live="polite">
      <header className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 bg-cyber-grid opacity-25"
          aria-hidden="true"
        />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-page px-4 py-16 sm:px-6 lg:px-8">
          <div className={`${lineBase} h-2.5 w-32`} />
          <div className="mt-6 space-y-3">
            <div className={`${lineBase} h-8 w-full sm:h-10 sm:w-7/12`} />
          </div>
          <div className="mt-6 space-y-2">
            <div className={`${lineBase} w-full`} />
            <div className={`${lineBase} w-9/12`} />
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-page gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        {/* Services list — three cards */}
        <div className="grid gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-border/60 bg-card/80 p-5"
            >
              <div className="flex flex-wrap gap-2">
                <div className={`${chipBase} w-20`} />
                <div className={`${chipBase} w-14`} />
              </div>
              <div className={`${lineBase} h-5 w-9/12`} />
              <div className="mt-2 space-y-2">
                <div className={`${lineBase} w-full`} />
                <div className={`${lineBase} w-10/12`} />
                <div className={`${lineBase} w-8/12`} />
              </div>
            </div>
          ))}
        </div>

        {/* Inquiry card */}
        <div className="grid gap-5 rounded-lg border border-border/60 bg-card/80 p-6">
          <div className={`${lineBase} h-3 w-24`} />
          <div className={`${lineBase} h-5 w-6/12`} />
          <div className="mt-2 grid gap-5">
            <div className={`${blockBase} h-10 w-full`} />
            <div className={`${blockBase} h-10 w-full`} />
            <div className={`${blockBase} h-10 w-full`} />
            <div className={`${blockBase} h-36 w-full`} />
            <div className="flex flex-wrap gap-3">
              <div className={`${blockBase} h-10 w-36`} />
              <div className={`${blockBase} h-10 w-32`} />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
