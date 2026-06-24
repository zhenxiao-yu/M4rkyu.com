"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BlurImage } from "@/components/ui/blur-image";
import { TiltedCard } from "@/components/ui/magic/tilted-card";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

interface Portrait {
  src: string;
  alt: string;
  caption?: string;
  focal: "top" | "center" | "bottom";
}

const FOCAL: Record<Portrait["focal"], string> = {
  top: "center top",
  center: "center",
  bottom: "center bottom",
};

const ROTATE_MS = 4200;

/**
 * The about hero's centrepiece: a big circular portrait that slowly cross-fades
 * through Mark's professional photos inside a 3D-tilting frame, ringed by a
 * faint glow and a single accent dot orbiting the rim. Until photos are added
 * (`profile.portraits`), the 于 monogram stands in. Reduced motion stops the
 * orbit + autoplay and shows one frame; the dots stay as manual controls. Touch
 * / coarse pointers get no tilt (TiltedCard degrades on its own).
 */
export function PortraitOrbit({
  portraits,
  monogram = "于",
  rotateLabel,
  className,
}: {
  portraits: Portrait[];
  monogram?: string;
  /** Template `"View portrait {index}"` for the dot controls. */
  rotateLabel: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const count = portraits.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (reduced || count < 2 || hover) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced, count, hover]);

  const active = count > 0 ? portraits[index % count] : null;

  return (
    <div
      className={cn("relative mx-auto w-full max-w-[18rem]", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Soft ring-ink glow grounding the circle. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-5 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--ring) 24%, transparent), transparent 68%)",
        }}
      />

      <TiltedCard maxTilt={10} glare={0.35} className="rounded-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border/70 bg-card">
          {active ? (
            <AnimatePresence>
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <BlurImage
                  src={active.src}
                  alt={active.alt}
                  fill
                  fadeOnly
                  sizes="(min-width: 1024px) 18rem, 60vw"
                  className="object-cover"
                  style={{ objectPosition: FOCAL[active.focal] }}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <MonogramFallback monogram={monogram} />
          )}

          {/* Inner rim + scanline veil — keeps the circle reading as a HUD
              aperture rather than a plain avatar. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-foreground/10"
          />
          <span
            aria-hidden="true"
            className="scanline-layer pointer-events-none absolute inset-0 rounded-full opacity-30"
          />
        </div>
      </TiltedCard>

      {/* Orbiting accent dot + dashed track — the "alive" signature. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <span className="absolute inset-[-3%] rounded-full border border-dashed border-ring/20" />
        <motion.span
          className="absolute inset-[-3%]"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-ring shadow-[0_0_8px_var(--ring)]" />
        </motion.span>
      </div>

      {/* Manual dots — present whenever there is more than one frame, so
          reduced-motion users can still page through. */}
      {count > 1 ? (
        <div
          role="tablist"
          aria-label={rotateLabel.replace(/\s*\{index\}/, "")}
          className="mt-4 flex items-center justify-center gap-1.5"
        >
          {portraits.map((portrait, i) => (
            <button
              key={portrait.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={rotateLabel.replace("{index}", String(i + 1))}
              onClick={() => setIndex(i)}
              className={cn(
                "group inline-flex size-5 items-center justify-center rounded-full",
                FOCUS_RING_INSET,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                  i === index
                    ? "bg-ring"
                    : "bg-muted-foreground/30 group-hover:bg-muted-foreground/60",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MonogramFallback({ monogram }: { monogram: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span
        aria-hidden="true"
        className="font-display text-[6rem] font-bold leading-none text-foreground/10"
      >
        {monogram}
      </span>
      <span className="noise-layer pointer-events-none absolute inset-0 rounded-full opacity-40" />
    </div>
  );
}
