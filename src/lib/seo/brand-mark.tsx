import type { ReactElement } from "react";

// Single source of truth for the "M4" monogram — used by the favicon
// (app/icon.tsx) and the iOS home-screen icon (app/apple-icon.tsx) so the
// mark never drifts between surfaces. Risograph palette: warm-ink ground,
// cream glyph, coral underscore (echoing the M4RK_YU wordmark + the header
// chip). Built for Satori / next/og `ImageResponse`, so styles are inline
// and flex-based — Satori supports no class names, CSS grid, or var().
const INK = "#0c0a06";
const CREAM = "#fcf8ee";
const CORAL = "#e8412a";

export function BrandMark({ size }: { size: number }): ReactElement {
  // Everything scales off the canvas so the glyph + underscore stay inside
  // the maskable / iOS-rounding safe zone (central ~80%) at any rendered
  // size, from the 512 PWA icon down to the 16px tab favicon.
  const fontSize = Math.round(size * 0.55);
  const barWidth = Math.round(size * 0.36);
  const barHeight = Math.max(2, Math.round(size * 0.058));
  const barGap = Math.round(size * 0.05);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: INK,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          color: CREAM,
          fontSize,
          fontWeight: 700,
          letterSpacing: Math.round(size * -0.026),
          lineHeight: 1,
        }}
      >
        M4
      </div>
      <div
        style={{
          marginTop: barGap,
          width: barWidth,
          height: barHeight,
          borderRadius: 999,
          background: CORAL,
        }}
      />
    </div>
  );
}
