import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/seo/brand-mark";

// Next.js convention: generates the site's primary `<link rel="icon">`,
// replacing the default browser request to /favicon.ico (which 404'd in
// prod). The "M4" monogram (warm-ink ground · cream glyph · coral
// underscore) is single-sourced in BrandMark so the tab favicon, the iOS
// home-screen icon (apple-icon.tsx), and the header chip stay the same
// mark — replacing the retired cyan-on-black glyph. Rendered 512×512 and
// full-bleed so it doubles as the maskable PWA install icon: the glyph +
// underscore sit inside the central safe zone, so masking never clips
// them. The browser downscales for the tab favicon.
export const size = { width: 512, height: 512 } as const;
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandMark size={size.width} />, size);
}
