/**
 * Skeleton shown while the `/logs` server component awaits the
 * dev.to listing fetch. Mirrors the live composition: hero + toolbar
 * + first batch of timeline rows. Static Tailwind `animate-pulse`
 * only; `prefers-reduced-motion` halts the pulse via Tailwind 4
 * defaults.
 */
export default function BlogLoading() {
  const lineBase =
    "h-3 rounded-sm bg-muted animate-pulse [animation-duration:1.6s]";
  const chipBase =
    "h-5 rounded-full bg-muted animate-pulse [animation-duration:1.6s]";
  return (
    <article aria-busy="true" aria-live="polite">
      {/* Hero */}
      <header className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 bg-cyber-grid opacity-30"
          aria-hidden="true"
        />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className={`${lineBase} h-2.5 w-32`} />
          <div className="mt-6 space-y-3">
            <div className={`${lineBase} h-8 w-full sm:h-10`} />
            <div className={`${lineBase} h-8 w-9/12 sm:h-10`} />
          </div>
          <div className="mt-6 space-y-2">
            <div className={`${lineBase} w-full`} />
            <div className={`${lineBase} w-10/12`} />
          </div>
        </div>
      </header>

      {/* Toolbar + list */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`${chipBase} w-12`} />
            <div className={`${chipBase} w-16`} />
            <div className={`${chipBase} w-20`} />
            <div className={`${chipBase} w-14`} />
            <div className={`${chipBase} w-16`} />
            <div className={`${chipBase} w-20`} />
            <div className={`${chipBase} w-12`} />
          </div>
          <div
            aria-hidden="true"
            className="h-10 w-full animate-pulse rounded-md bg-muted [animation-duration:1.6s] lg:w-72"
          />
        </div>

        <ol className="mt-8 grid gap-1 divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="py-5">
              <div className="grid gap-3">
                <div className={`${lineBase} h-4 w-9/12 sm:w-7/12`} />
                <div className={`${lineBase} w-10/12 sm:w-6/12`} />
                <div className="flex flex-wrap gap-1.5">
                  <div className={`${chipBase} w-12`} />
                  <div className={`${chipBase} w-16`} />
                  <div className={`${chipBase} w-14`} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
