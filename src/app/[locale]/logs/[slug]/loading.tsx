/**
 * Skeleton shown while the post-detail server component awaits the
 * dev.to fetch + Shiki highlight pass. Mirrors the live layout of
 * `PostHeader` + `PostBody` so the screen is painted before the
 * route's RSC payload resolves — a click on a timeline row goes
 * from "blank" to "loading" with no perceived gap.
 *
 * Uses static Tailwind `animate-pulse` only; no client motion.
 * `prefers-reduced-motion` automatically halts pulse via Tailwind 4
 * defaults so this is safe to unconditionally render.
 */
export default function BlogPostLoading() {
  const lineBase =
    "h-3 rounded-sm bg-muted animate-pulse [animation-duration:1.6s]";
  return (
    <article aria-busy="true" aria-live="polite">
      <header className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 bg-cyber-grid opacity-30"
          aria-hidden="true"
        />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Eyebrow */}
          <div className={`${lineBase} h-2.5 w-44`} />

          {/* Title — three rough lines descending in width */}
          <div className="mt-6 space-y-3">
            <div className={`${lineBase} h-8 w-full sm:h-10`} />
            <div className={`${lineBase} h-8 w-11/12 sm:h-10`} />
            <div className={`${lineBase} h-8 w-7/12 sm:h-10`} />
          </div>

          {/* Description */}
          <div className="mt-6 space-y-2">
            <div className={`${lineBase} w-full`} />
            <div className={`${lineBase} w-10/12`} />
          </div>

          {/* Meta ribbon */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className={`${lineBase} h-2.5 w-20`} />
            <div className={`${lineBase} h-2.5 w-16`} />
            <div className={`${lineBase} h-2.5 w-10`} />
          </div>

          {/* Tag chips */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            <div className={`${lineBase} h-5 w-14`} />
            <div className={`${lineBase} h-5 w-20`} />
            <div className={`${lineBase} h-5 w-16`} />
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className={`${lineBase} h-8 w-32 rounded-md`} />
            <div className={`${lineBase} h-8 w-24 rounded-md`} />
          </div>
        </div>
      </header>

      {/* Body */}
      <section className="mx-auto w-full max-w-3xl bg-muted/10 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="space-y-3">
          {/* Paragraph blocks */}
          <div className={`${lineBase} w-full`} />
          <div className={`${lineBase} w-11/12`} />
          <div className={`${lineBase} w-10/12`} />
          <div className={`${lineBase} w-9/12`} />
        </div>
        <div className="mt-8 space-y-3">
          <div className={`${lineBase} w-1/3`} />
          <div className={`${lineBase} w-full`} />
          <div className={`${lineBase} w-11/12`} />
          <div className={`${lineBase} w-10/12`} />
        </div>
        {/* Faux code block */}
        <div
          aria-hidden="true"
          className="mt-8 h-40 w-full animate-pulse rounded-md border border-border bg-muted/60 [animation-duration:1.6s]"
        />
        <div className="mt-8 space-y-3">
          <div className={`${lineBase} w-full`} />
          <div className={`${lineBase} w-9/12`} />
          <div className={`${lineBase} w-10/12`} />
        </div>
      </section>
    </article>
  );
}
