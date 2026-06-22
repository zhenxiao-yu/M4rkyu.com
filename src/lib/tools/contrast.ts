// WCAG 2.x pass/fail grading for a contrast ratio. The ratio itself comes
// from `contrastRatio` in ./color (pure + unit-tested); this module only maps
// a ratio to the four conformance buckets. No React, no DOM —
// unit-tested in tests/unit/tools/contrast.test.ts.

/** WCAG 2.x conformance thresholds. */
export const WCAG_THRESHOLDS = {
  aaNormal: 4.5,
  aaaNormal: 7,
  aaLarge: 3,
  aaaLarge: 4.5,
} as const;

export interface ContrastGrades {
  aaNormal: boolean;
  aaaNormal: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
}

/** Map a contrast ratio (1–21) to AA/AAA pass/fail for normal + large text. */
export function gradeContrast(ratio: number): ContrastGrades {
  return {
    aaNormal: ratio >= WCAG_THRESHOLDS.aaNormal,
    aaaNormal: ratio >= WCAG_THRESHOLDS.aaaNormal,
    aaLarge: ratio >= WCAG_THRESHOLDS.aaLarge,
    aaaLarge: ratio >= WCAG_THRESHOLDS.aaaLarge,
  };
}
