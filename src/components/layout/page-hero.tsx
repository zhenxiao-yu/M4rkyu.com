import type { ReactNode } from "react";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { SectionHeading } from "@/components/sections/section-heading";
import { RisographMarks } from "@/components/sections/risograph-marks";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  decorativeWord?: string;
  /** Extra full-bleed backdrop layers (e.g. arcade scanlines + accent
   * glow) — sit above the base grid, below the content + frame. Lets a
   * page juice the shared hero with its own effects without changing its
   * height / size / layout. */
  effects?: ReactNode;
  disableGlitch?: boolean;
  className?: string;
  contentClassName?: string;
  sidecarClassName?: string;
}

// Shared index-route hero — aligns headers across work/archive/logs/games/media/resources/about/contact; preserves optional right rail.
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  meta,
  actions,
  decorativeWord,
  effects,
  disableGlitch,
  className,
  contentClassName,
  sidecarClassName,
}: PageHeroProps) {
  const hasSidecar = Boolean(children);

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b bg-background",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-cyber-grid opacity-25"
        aria-hidden="true"
      />
      {/* Tri-ink aurora — the theme's full ink trio washes the header field,
        * fading out before the content baseline so type stays crisp. */}
      <div
        className="aurora-mesh pointer-events-none absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent_86%)]"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <DotGrid
        className="pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
        spacing={34}
        baseDotSize={1}
        hoverDotSize={3.4}
        influenceRadius={150}
        baseOpacity={0.12}
      />

      {effects}

      {/* Instrument frame — corner registration ticks that bracket the
        * header as a HUD panel (echoing the status strip's CornerTick),
        * sm+ only so phones stay uncluttered. `top-24` clears the sticky
        * dock + status strip. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden sm:block"
      >
        <span className="absolute left-4 top-24 size-3 border-l border-t border-foreground/25 lg:left-6" />
        <span className="absolute right-4 top-24 size-3 border-r border-t border-foreground/25 lg:right-6" />
        <span className="absolute bottom-4 left-4 size-3 border-b border-l border-foreground/25 lg:left-6" />
        <span className="absolute bottom-4 right-4 size-3 border-b border-r border-foreground/25 lg:right-6" />
      </div>
      {/* Accent baseline — the theme's three inks sign the bottom edge,
        * doubling as the ruled line the ghosted wordmark sits on. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ring) 65%, transparent) 20%, color-mix(in srgb, var(--ring-3) 70%, transparent) 50%, color-mix(in srgb, var(--ring-2) 65%, transparent) 80%, transparent)",
        }}
      />

      {decorativeWord ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-end overflow-hidden"
        >
          {/* Oversized folio word, bled off the lower-left edge on every
            * viewport — the editorial anchor that turns each header into a
            * magazine spread instead of a heading floating in an empty box.
            * `clamp` keeps it bold on phones and capped on desktop; long
            * words run off the right edge by design (the bleed is the
            * device). Kept faint enough to sit behind the live copy. */}
          <span className="mb-[-0.14em] ml-[-0.03em] whitespace-nowrap font-display text-[clamp(5rem,26vw,15rem)] font-black uppercase leading-[0.8] tracking-[-0.045em] text-foreground/4.5 dark:text-foreground/6">
            {decorativeWord}
          </span>
        </div>
      ) : null}

      {/* Press-proof chrome — risograph-only registration marks + spot-ink bar,
        * bottom-right, balancing the folio word that bleeds bottom-left. */}
      <RisographMarks />

      <div
        className={cn(
          "relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8",
          hasSidecar &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:items-end lg:gap-12",
          contentClassName,
        )}
      >
        <BlurFade>
          <SectionHeading
            as="h1"
            eyebrow={eyebrow}
            title={title}
            description={description}
            disableGlitch={disableGlitch}
          />
          {meta || actions ? (
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {meta ? <div className="min-w-0 flex-1">{meta}</div> : null}
              {actions ? (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}
        </BlurFade>

        {hasSidecar ? (
          <BlurFade
            delay={0.1}
            className={cn("lg:justify-self-end", sidecarClassName)}
          >
            {children}
          </BlurFade>
        ) : null}
      </div>
    </section>
  );
}
