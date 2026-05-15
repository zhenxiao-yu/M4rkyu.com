import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

// Bundle a Noto Sans SC subset alongside the renderer so Satori can
// shape CJK glyphs in OG titles/subtitles. The subset is built from
// the repo's actual zh content (messages + content layer) plus basic
// Latin / punctuation ranges, so it stays small (~190 KB) instead of
// shipping the full ~7 MB CJK Common range. Next 16's ImageResponse
// docs show local fonts loaded with readFile; this avoids Turbopack
// rewriting import.meta.url assets to a relative /_next URL that Node
// cannot parse during static metadata generation.
//
// Regenerating after adding new zh content (one-shot, build-time only;
// no project deps added):
//   1. Download NotoSansSC[wght].ttf from
//      https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
//   2. pip install --user fonttools brotli
//   3. fonttools varLib.instancer NotoSansSC[wght].ttf wght=400 -o sc-400.ttf
//   4. Scan src/ + messages/ for unique CJK codepoints and write them
//      to cjk-chars.txt (one char per line is fine).
//   5. pyftsubset sc-400.ttf --output-file=NotoSansSC-Regular.subset.ttf \
//        --unicodes="U+0020-007F,U+00A0-00FF,U+2000-206F,U+2E00-2E7F,U+3000-303F,U+FF00-FFEF" \
//        --text-file=cjk-chars.txt --no-hinting --desubroutinize \
//        --drop-tables+=DSIG --no-glyph-names
//   6. Replace src/lib/seo/fonts/NotoSansSC-Regular.subset.ttf and commit.
const fontPromise = readFile(
  join(process.cwd(), "src/lib/seo/fonts/NotoSansSC-Regular.subset.ttf"),
).then(
  (buffer) =>
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
);

// Heuristic: shrink the title font when it's long. CJK glyphs are
// visually ~1.7× wider than Latin, so we count them weighted.
function effectiveLength(value: string): number {
  let length = 0;
  for (const ch of value) {
    length += /[㐀-鿿豈-﫿　-〿]/.test(ch) ? 1.7 : 1;
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
 * The renderer bundles a Noto Sans SC subset (see `fontPromise`
 * above) so CJK titles/subtitles render correctly. The subset is
 * derived from the repo's content; characters outside that set will
 * fall back to system sans and may render as tofu.
 */
export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  footer = "m4rkyu.com",
}: OgImageProps): Promise<ImageResponse> {
  const len = effectiveLength(title);
  const fontData = await fontPromise;
  return new ImageResponse(
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
        fontFamily: "Noto Sans SC, ui-sans-serif, system-ui, sans-serif",
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
            fontFamily: "Noto Sans SC, ui-sans-serif, system-ui, sans-serif",
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
              fontFamily: "Noto Sans SC, ui-sans-serif, system-ui, sans-serif",
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
    </div>,
    {
      ...OG_IMAGE_SIZE,
      // The subset was instanced at wght=400. Register the same data
      // under both 400 and 700 so Satori matches either weight request
      // (title is bold, subtitle is regular) without synthesizing.
      fonts: [
        {
          name: "Noto Sans SC",
          data: fontData,
          style: "normal",
          weight: 400,
        },
        {
          name: "Noto Sans SC",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
