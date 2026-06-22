// Pure organic-blob path generator. No React, no DOM — unit-tested in
// tests/unit/tools/blob.test.ts. The Tool owns only input state + the live
// preview; it hands clamped params here so the emitted `d` attribute is
// deterministic for a given seed and can never contain NaN.

/** Canvas the blob is sampled inside; the viewBox is `0 0 SIZE SIZE`. */
export const BLOB_SIZE = 200;

/** Inclusive bounds for the user-facing controls. Shared with the Tool + tests. */
export const BLOB_LIMITS = {
  complexity: { min: 3, max: 12 },
  /** Contrast (vertex jitter) as a percentage in [0, 90]. */
  contrast: { min: 0, max: 90 },
} as const;

export interface BlobParams {
  /** Vertex count — higher = more lobes. Clamped into BLOB_LIMITS.complexity. */
  complexity: number;
  /** Radius jitter as a percentage [0, 90]. Clamped into BLOB_LIMITS.contrast. */
  contrast: number;
  /** Integer seed. The same seed always yields the same path. */
  seed: number;
}

export interface BlobResult {
  /** SVG `d` attribute, e.g. `M100,24C…Z`. Always starts with `M`. */
  path: string;
  /** Vertex count actually used after clamping. */
  points: number;
  /** Edge length of the square viewBox. */
  size: number;
}

/**
 * Tiny seeded PRNG (mulberry32). Deterministic for a given 32-bit seed, so a
 * blob can be reproduced or shared from its seed alone. Returns a function
 * yielding floats in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Build an organic blob outline.
 *
 * Samples `complexity` vertices evenly around a circle, perturbs each radius by
 * up to `contrast`%, then threads a closed Catmull-Rom spline (expressed as
 * cubic béziers) through them for a smooth, gooey outline.
 *
 * - Deterministic: same `{ complexity, contrast, seed }` → byte-identical path.
 * - NaN-safe: non-finite params collapse to their clamped minimum.
 * - Optionally accepts an external `rng` (for tests) — defaults to a
 *   seed-derived mulberry32.
 */
export function generateBlob(
  { complexity, contrast, seed }: BlobParams,
  rng: () => number = mulberry32(Math.trunc(Number.isFinite(seed) ? seed : 0)),
): BlobResult {
  const points = Math.trunc(
    clamp(complexity, BLOB_LIMITS.complexity.min, BLOB_LIMITS.complexity.max),
  );
  const jitter =
    clamp(contrast, BLOB_LIMITS.contrast.min, BLOB_LIMITS.contrast.max) / 100;

  const cx = BLOB_SIZE / 2;
  const cy = BLOB_SIZE / 2;
  const base = BLOB_SIZE * 0.38;

  // One radius per vertex, varied by `jitter`. rng() is consumed once per
  // vertex so point count and contrast both feed the seeded sequence.
  const pts = Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const rad = base * (1 - jitter / 2 + rng() * jitter);
    return [cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad] as const;
  });

  // Closed Catmull-Rom → cubic bézier for a smooth organic outline.
  const n = pts.length;
  let path = `M${round2(pts[0][0])},${round2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += `C${round2(c1x)},${round2(c1y)} ${round2(c2x)},${round2(c2y)} ${round2(p2[0])},${round2(p2[1])}`;
  }
  path += "Z";

  return { path, points, size: BLOB_SIZE };
}

/** Full standalone `<svg>` document for the given path + fill (copy/paste). */
export function buildBlobSvg(path: string, fill: string): string {
  return `<svg viewBox="0 0 ${BLOB_SIZE} ${BLOB_SIZE}" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${fill}" d="${path}" />\n</svg>`;
}

/** CSS `clip-path: path(...)` declaration for masking an element to the blob. */
export function buildBlobClipPath(path: string): string {
  return `clip-path: path("${path}");`;
}
