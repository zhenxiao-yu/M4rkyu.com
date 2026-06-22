import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/seo/brand-mark";

// Next.js convention: emits <link rel="apple-touch-icon"> for the iOS
// home-screen / "Add to Home Screen" tile. iOS rounds the corners itself
// and ignores transparency, so the mark is full-bleed opaque ink with the
// "M4" monogram kept well inside the safe zone. 180×180 is Apple's
// recommended touch-icon size; shares the BrandMark source with the
// favicon so the two never drift.
export const size = { width: 180, height: 180 } as const;
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={size.width} />, size);
}
