import { ImageResponse } from "next/og";

// Next.js convention: this generates the site's primary `<link rel="icon">`
// at build time, replacing the default browser request to /favicon.ico
// (which 404'd on production and surfaced as a console error in the
// Lighthouse "errors-in-console" audit). A 32×32 monogram is enough for
// browser tab UI and avoids shipping a separate static asset.
export const size = { width: 32, height: 32 } as const;
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
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
