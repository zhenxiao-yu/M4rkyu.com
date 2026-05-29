import { ImageResponse } from "next/og";

// Next.js convention: generates the site's primary `<link rel="icon">`,
// replacing the default browser request to /favicon.ico (which 404'd in
// prod). Rendered at 512×512 so the same monogram doubles as the PWA
// install / maskable icon — the glyph stays inside the central safe zone
// (full-bleed background, centred M) so maskable masking never clips it.
// The browser downscales for the tab favicon.
export const size = { width: 512, height: 512 } as const;
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070707",
          color: "#67e8f9",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 340,
          fontWeight: 700,
          letterSpacing: -8,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
