"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * A single resolved theme ink, in three shapes so every consumer gets
 * what it needs without re-parsing:
 *  - `rgbString` → "r, g, b" (0–255), drop straight into `rgba(${s}, a)`
 *    for canvas-2D fills.
 *  - `rgb`       → [r, g, b] (0–255).
 *  - `float`     → [r, g, b] (0–1), sRGB-encoded — feed THREE.Color via
 *    `.setRGB(r, g, b, THREE.SRGBColorSpace)` so color management stays
 *    correct.
 */
export interface Ink {
  rgbString: string;
  rgb: [number, number, number];
  float: [number, number, number];
}

/**
 * The three accent inks plus ground tones for the active
 * `data-palette` × `data-theme` pair. Never more than the three inks
 * (`ring` / `ring2` / `ring3`) — the palette doctrine forbids a fourth.
 */
export interface ThemeInks {
  ring: Ink;
  ring2: Ink;
  ring3: Ink;
  foreground: Ink;
  background: Ink;
}

const INK_VARS = {
  ring: "--ring",
  ring2: "--ring-2",
  ring3: "--ring-3",
  foreground: "--foreground",
  background: "--background",
} as const;

// Neutral grey — only ever shown for the sliver between mount and the
// effect's first read (or on the server, where there is no DOM to probe).
const FALLBACK: [number, number, number] = [128, 128, 128];

function parseColor(value: string): [number, number, number] {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return FALLBACK;
  const parts = match[1]
    .split(",")
    .slice(0, 3)
    .map((p) => Number.parseFloat(p));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return FALLBACK;
  return [parts[0], parts[1], parts[2]];
}

function toInk(rgb: [number, number, number]): Ink {
  return {
    rgb,
    rgbString: rgb.map((c) => Math.round(c)).join(", "),
    float: [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255],
  };
}

function neutralInks(): ThemeInks {
  const fb = toInk(FALLBACK);
  return { ring: fb, ring2: fb, ring3: fb, foreground: fb, background: fb };
}

/**
 * Read the current theme inks once, synchronously, off the live DOM.
 *
 * Tokens may be authored as `oklch`, `color-mix`, hex, etc.; rather than
 * reimplement CSS colour parsing we set them on a throwaway probe span
 * and let `getComputedStyle().color` hand us the concrete `rgb()` the
 * browser computed. One span, read five times. Server-safe (returns the
 * neutral fallback when there's no `document`).
 */
export function readThemeInks(): ThemeInks {
  if (typeof document === "undefined") return neutralInks();
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  document.body.appendChild(probe);
  const read = (cssVar: string): Ink => {
    probe.style.color = `var(${cssVar})`;
    return toInk(parseColor(getComputedStyle(probe).color));
  };
  const inks: ThemeInks = {
    ring: read(INK_VARS.ring),
    ring2: read(INK_VARS.ring2),
    ring3: read(INK_VARS.ring3),
    foreground: read(INK_VARS.foreground),
    background: read(INK_VARS.background),
  };
  probe.remove();
  return inks;
}

/**
 * Subscribe to theme-ink changes. Returns a stable ref whose `.current`
 * always holds the latest inks — an animation loop can read
 * `inksRef.current` every frame and lerp toward it with zero React
 * re-renders. The observer watches **both** `data-theme` and
 * `data-palette` on `<html>`; the older inline probes (waves, dot-grid)
 * only watch `data-theme`, so a palette swap leaves them stale — this
 * fixes that for anything that adopts the hook.
 *
 * Pass `onChange` for imperative consumers that repaint rather than lerp
 * (e.g. canvas-2D fields) — it fires on mount and on every theme/palette
 * flip with the freshly-read inks.
 */
export function useThemeInks(onChange?: (inks: ThemeInks) => void): {
  inksRef: RefObject<ThemeInks>;
} {
  const inksRef = useRef<ThemeInks>(neutralInks());
  const onChangeRef = useRef(onChange);
  // Keep the latest callback without re-subscribing the observer. Writing
  // a ref during render is disallowed (react-hooks/refs), so sync it here.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const update = () => {
      inksRef.current = readThemeInks();
      onChangeRef.current?.(inksRef.current);
    };
    // First real read happens here (the ref init above is the neutral
    // placeholder that covers the pre-effect frame).
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });
    return () => observer.disconnect();
  }, []);

  return { inksRef };
}
