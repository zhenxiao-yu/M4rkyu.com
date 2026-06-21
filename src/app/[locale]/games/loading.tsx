import {
  SkeletonGrid,
  SkeletonHero,
  SkeletonStatusCard,
} from "@/components/placeholders/skeleton";

/**
 * Suspense fallback for `/games`. Mirrors the live arcade hero (floor glow +
 * masked scanline) over the skeleton band, then the real cartridge-shelf grid
 * shape so nothing shifts when `GameCartridge`s mount. Atmosphere stays inside
 * the skeleton's two-ink budget (--ring only).
 */
export default function GamesLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <div className="relative">
        <SkeletonHero
          atmosphereOpacity="opacity-35"
          rightSlot={<SkeletonStatusCard />}
        />
        {/* Arcade tell — the same floor glow + scanline the live hero carries. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 60% at 50% 100%, color-mix(in srgb, var(--ring) 16%, transparent), transparent 65%)",
            }}
          />
          <div
            aria-hidden="true"
            className="scanline-layer absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_75%,transparent)]"
          />
        </div>
      </div>
      <section className="mx-auto w-full max-w-page px-4 py-20 sm:px-6 lg:px-8">
        <SkeletonGrid
          count={6}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4"
        />
      </section>
    </article>
  );
}
