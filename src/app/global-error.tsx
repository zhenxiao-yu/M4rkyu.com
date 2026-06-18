"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary. Unlike `[locale]/error.tsx`, this catches
 * failures in the root layout itself, so it renders *outside* every
 * provider — no next-intl, no theme, and no guarantee that the global
 * stylesheet has loaded. It must therefore declare its own
 * `<html>`/`<body>` and rely on inline styles (Tailwind tokens from
 * globals.css are not guaranteed here). English-only by necessity: the
 * locale provider lives above this node and is unavailable. Last-resort
 * recovery is a full reload rather than a segment retry.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("[M4RKYU.SYS] root error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#050505",
          color: "#f2f0ea",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
      >
        <main style={{ width: "100%", maxWidth: "32rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8a877f",
            }}
          >
            M4RKYU.SYS · Fault
          </p>
          <h1
            style={{
              margin: "1.25rem 0 0",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              fontWeight: 600,
            }}
          >
            The archive dropped a frame.
          </h1>
          <p
            style={{
              margin: "1.25rem 0 0",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "#b8b5ad",
            }}
          >
            Something failed before the page could load. Reloading usually
            clears it.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: "1rem 0 0",
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                color: "#8a877f",
              }}
            >
              REF {error.digest}
            </p>
          ) : null}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                appearance: "none",
                cursor: "pointer",
                border: "1px solid #f2f0ea",
                background: "#f2f0ea",
                color: "#050505",
                padding: "0.7rem 1.4rem",
                font: "inherit",
                fontSize: "0.85rem",
                borderRadius: "0.4rem",
              }}
            >
              Reload
            </button>
            {/* A hard document navigation, not next/link: in a root-layout
              * crash the router context may be unavailable, so we force a
              * full load back to the locale-negotiating root. */}
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                appearance: "none",
                cursor: "pointer",
                border: "1px solid #3a3833",
                background: "transparent",
                color: "#f2f0ea",
                padding: "0.7rem 1.4rem",
                font: "inherit",
                fontSize: "0.85rem",
                borderRadius: "0.4rem",
              }}
            >
              Home
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
