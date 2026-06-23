"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A restrained "moon" that genuinely orbits the footer wordmark — a lightweight
 * echo of a draggable 3D moon, done with transforms instead of WebGL. Colour
 * stays in CSS vars (var(--ring)) so it is theme-reactive for free.
 *
 * It renders as TWO instances bracketing the wordmark: layer="back" (-z-10,
 * behind the glyphs) and layer="front" (z-20, over them). A single shared rAF
 * driver feeds both from ONE angle, so the disc dives behind the M and emerges
 * in front of the U without the two layers ever desyncing.
 *
 * Motion discipline (project rules):
 *  - prefers-reduced-motion → one crescent parked on the front layer, no loop.
 *  - coarse pointer → orbit animates, but no pointer-parallax listener.
 *  - off-screen (IntersectionObserver) or backgrounded (visibilitychange)
 *    → the shared loop fully stops, so cost when unseen is zero.
 */

// Orbit geometry / cadence — shared by both layers.
const RX_RATIO = 0.34; // less pancake-flat than before so passes cross the letters
const RY_RATIO = 0.28;
const ANGULAR_SPEED = 0.175; // rad/s → ~36s per revolution, a deliberate drift
const TRAIL = 4;

type MoonFrame = (angle: number, cursorX: number, cursorY: number) => void;

// ---- Shared animation driver -------------------------------------------
// ONE rAF loop feeds every subscriber, so the back and front layers always
// read the SAME angle. It runs only while ≥1 instance is on-screen and the
// tab is visible.
const subscribers = new Set<MoonFrame>();
let active = 0;
let rafId = 0;
let startedAt = 0;
let cursorX = 0;
let cursorY = 0;
let pointerBound = false;

function onPointerMove(event: PointerEvent) {
  cursorX = event.clientX;
  cursorY = event.clientY;
}

function tick(now: number) {
  if (!startedAt) startedAt = now;
  const angle = ((now - startedAt) / 1000) * ANGULAR_SPEED + Math.PI;
  for (const fn of subscribers) fn(angle, cursorX, cursorY);
  rafId = window.requestAnimationFrame(tick);
}

function startDriver() {
  if (rafId) return;
  if (!pointerBound && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    pointerBound = true;
  }
  rafId = window.requestAnimationFrame(tick);
}

function stopDriver() {
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
  if (pointerBound) {
    window.removeEventListener("pointermove", onPointerMove);
    pointerBound = false;
  }
}

function syncDriver() {
  if (active > 0 && !document.hidden) startDriver();
  else stopDriver();
}

function setActive(delta: number) {
  const prev = active;
  active += delta;
  if (active < 0) active = 0;
  if (prev === 0 && active > 0) {
    document.addEventListener("visibilitychange", syncDriver);
  } else if (active === 0) {
    document.removeEventListener("visibilitychange", syncDriver);
  }
  syncDriver();
}

// ---- helpers ------------------------------------------------------------
function clamp(n: number, lo = -1, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}
function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

export function FooterMoonScene({
  layer,
  className,
}: {
  layer: "back" | "front";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const moonRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const scene = sceneRef.current;
    const moon = moonRef.current;
    const glow = glowRef.current;
    if (!scene || !moon || !glow) return;
    const trail = trailRefs.current.filter(Boolean) as HTMLDivElement[];

    // Position one disc (lead = trailIndex 0, ghosts 1..n) at a given angle.
    const placeDisc = (
      node: HTMLDivElement,
      glowNode: HTMLDivElement | null,
      angle: number,
      rx: number,
      ry: number,
      px: number,
      py: number,
      layerAlpha: number,
      trailIndex: number,
    ) => {
      const ox = Math.cos(angle) * rx + px;
      const oy = Math.sin(angle) * ry + py;
      const depth = (Math.sin(angle) + 1) / 2; // 0 = back of orbit, 1 = front
      const scale = (0.68 + depth * 0.52) * Math.pow(0.9, trailIndex);
      const lead =
        layer === "front" ? 0.45 + depth * 0.5 : Math.min(0.5, 0.3 + depth * 0.4);
      const opacity = lead * Math.pow(0.5, trailIndex) * layerAlpha;
      node.style.transform = `translate3d(calc(-50% + ${ox.toFixed(1)}px), calc(-50% + ${oy.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
      node.style.opacity = opacity.toFixed(3);
      if (glowNode) {
        const glowAlpha =
          (layer === "front" ? 0.2 + depth * 0.42 : 0.12 + depth * 0.28) * layerAlpha;
        glowNode.style.transform = `translate3d(calc(-50% + ${ox.toFixed(1)}px), calc(-50% + ${oy.toFixed(1)}px), 0)`;
        glowNode.style.opacity = glowAlpha.toFixed(3);
      }
    };

    // Reduced motion: park one crescent on the FRONT layer (still reads as
    // orbiting in front of the wordmark); the BACK layer hides its disc. The
    // static rings keep the orbital-plane idea alive as a still composition.
    if (reduce) {
      if (layer === "front") {
        placeDisc(
          moon,
          glow,
          Math.PI * 1.25,
          scene.clientWidth * RX_RATIO,
          scene.clientHeight * RY_RATIO,
          0,
          0,
          1,
          0,
        );
      } else {
        moon.style.opacity = "0";
        glow.style.opacity = "0";
      }
      for (const ghost of trail) ghost.style.opacity = "0";
      return;
    }

    let cx = 0;
    let cy = 0;

    const render: MoonFrame = (angle, curX, curY) => {
      const rect = scene.getBoundingClientRect();
      if (!rect.width) return;
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      const tx = clamp((curX - (rect.left + halfW)) / halfW) * 20;
      const ty = clamp((curY - (rect.top + halfH)) / halfH) * 12;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const rx = rect.width * RX_RATIO;
      const ry = rect.height * RY_RATIO;
      const depth = (Math.sin(angle) + 1) / 2;
      // Crossfade the hand-off across a narrow band at the ellipse apexes,
      // where the disc is at the screen edge and the swap is invisible.
      const front = smoothstep(0.45, 0.55, depth);
      const layerAlpha = layer === "front" ? front : 1 - front;
      placeDisc(moon, glow, angle, rx, ry, cx, cy, layerAlpha, 0);
      trail.forEach((ghost, i) =>
        placeDisc(ghost, null, angle - (i + 1) * 0.1, rx, ry, cx, cy, layerAlpha, i + 1),
      );
    };

    subscribers.add(render);
    let counted = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          setActive(1);
        } else if (!entry.isIntersecting && counted) {
          counted = false;
          setActive(-1);
        }
      },
      { threshold: 0 },
    );
    io.observe(scene);

    return () => {
      io.disconnect();
      subscribers.delete(render);
      if (counted) setActive(-1);
    };
  }, [reduce, layer]);

  // Front disc sits over the glyph ink → brighter core + stronger glow. Back
  // disc reads "behind glass" → dimmer. All colour is var(--ring) color-mix.
  const discBackground =
    layer === "front"
      ? "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--ring) 95%, #fff 5%), color-mix(in srgb, var(--ring) 52%, transparent) 72%)"
      : "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--ring) 80%, #fff 6%), color-mix(in srgb, var(--ring) 40%, transparent) 72%)";
  const moonShadow =
    layer === "front"
      ? "0 0 26px 3px color-mix(in srgb, var(--ring) 58%, transparent), inset -2px -1px 4px color-mix(in srgb, var(--background) 55%, transparent)"
      : "0 0 18px 2px color-mix(in srgb, var(--ring) 38%, transparent), inset -2px -1px 4px color-mix(in srgb, var(--background) 55%, transparent)";

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_72%_120%_at_50%_50%,black_28%,transparent_82%)]",
        className,
      )}
    >
      {/* Two concentric tilted rings imply the orbital plane — drawn once, on
          the back layer only, so they sit behind the wordmark. */}
      {layer === "back" && (
        <>
          <div
            className="absolute left-1/2 top-1/2 h-[56%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
            style={{ borderColor: "color-mix(in srgb, var(--ring) 15%, transparent)" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[51%] w-[63%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
            style={{ borderColor: "color-mix(in srgb, var(--ring) 9%, transparent)" }}
          />
        </>
      )}

      {/* Ambient glow (travels with the lead moon) */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 size-44 rounded-full blur-2xl will-change-transform"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--ring) 30%, transparent), transparent 70%)",
        }}
      />

      {/* Motion trail — faint same-ink ghosts, no glow, no will-change */}
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 size-3 rounded-full opacity-0 sm:size-3.5"
          style={{ background: discBackground }}
        />
      ))}

      {/* Lead moon */}
      <div
        ref={moonRef}
        className="absolute left-1/2 top-1/2 size-3 rounded-full opacity-0 will-change-transform sm:size-3.5"
        style={{ background: discBackground, boxShadow: moonShadow }}
      />
    </div>
  );
}
