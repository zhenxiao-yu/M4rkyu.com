import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";
export const OG_FOOTER_TAG = "ZX MARK YU · 2027";

interface OgImageProps {
  /** Mono uppercase eyebrow above the title (e.g. "case study"). */
  eyebrow: string;
  /** Large display-font title. */
  title: string;
  /** Muted subtitle / lede beneath the title. Optional. */
  subtitle?: string;
  /** Footer line (e.g. domain or section path). Defaults to the site URL. */
  footer?: string;
}

const BG = "#070707";
const FG = "#f7f7f7";
const MUTED = "#9a9a9a";
const RING = "#67e8f9";
const BORDER = "#27272a";

// Heuristic: shrink the title font when it's long. CJK glyphs are
// visually ~1.7× wider than Latin, so we count them weighted.
function effectiveLength(value: string): number {
  let length = 0;
  for (const ch of value) {
    length += /[㐀-鿿豈-﫿　-〿]/.test(ch) ? 1.7 : 1;
  }
  return length;
}

/**
 * Renders a 1200×630 OG image with the site's editorial vocabulary:
 * dark background, cyber-grid wash, mono eyebrow, large display
 * title, ring-color underline accent, mono footer.
 *
 * `next/og` runs Satori, which supports a subset of CSS via inline
 * `style` only (no Tailwind classes). All values are literal hex/px
 * so SSR + Edge runtime evaluate cleanly.
 *
 * Note: this renderer ships with `next/og`'s default Latin font
 * only — no CJK font is bundled. Callers should keep `title` /
 * `subtitle` content in Latin script. Mixing in CJK characters
 * will render as tofu boxes until a font is wired in.
 */
export function renderOgImage({
  eyebrow,
  title,
  subtitle,
  footer = "m4rkyu.com",
}: OgImageProps): ImageResponse {
  const len = effectiveLength(title);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Cyber-grid wash via two repeating linear gradients. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`,
            backgroundSize: "60px 60px, 60px 60px",
            opacity: 0.45,
          }}
        />
        {/* Subtle accent wash toward the bottom. Satori's radial
         * support is partial; a top-to-bottom linear gradient
         * fades cleanly to a soft ring tint above the footer. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, transparent 55%, rgba(103, 232, 249, 0.12) 100%)`,
          }}
        />
        {/* Top eyebrow row. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: MUTED,
            zIndex: 1,
          }}
        >
          <span
            style={{
              display: "inline-block",
              height: 1,
              width: 56,
              background: BORDER,
            }}
          />
          {eyebrow}
        </div>

        {/* Title block. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: len > 48 ? 80 : len > 24 ? 96 : 112,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: FG,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.32,
                color: MUTED,
                maxWidth: 880,
              }}
            >
              {subtitle}
            </div>
          ) : null}
          <div
            style={{
              height: 2,
              width: 96,
              background: RING,
              opacity: 0.65,
            }}
          />
        </div>

        {/* Footer row. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
            zIndex: 1,
          }}
        >
          <span>{footer}</span>
          <span>{OG_FOOTER_TAG}</span>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
