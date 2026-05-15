import type { SVGProps } from "react";

/**
 * Four-point star glyph (sparkle / asterisk style) used as the
 * separator between "Creative" and "Developer" in the hero headline.
 *
 * Inlined as a React component (vs. linking `/star.svg`) so it:
 *   - inherits `currentColor` from the headline, theming for free
 *   - sits on the same baseline as adjacent text glyphs
 *   - ships in the same chunk as the hero (no extra request)
 *
 * The path data is verbatim from the user's `asset-star.svg`. The
 * original `fill="#160000"` was swapped for `currentColor` so light
 * and dark themes both render correctly.
 */
export function StarGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 49 49"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="m24.5 0 3.3 21.2L49 24.5l-21.2 3.3L24.5 49l-3.3-21.2L0 24.5l21.2-3.3L24.5 0z" />
    </svg>
  );
}
