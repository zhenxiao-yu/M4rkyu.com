import { PixelTransitionOverlay } from "@/components/ui/pixel/pixel-transition-overlay";

/**
 * App Router loading state for /work. Renders a stepped top-down
 * curtain via PixelTransitionOverlay (Phase 6) while the route resolves.
 * The page header / footer stay visible because layout.tsx wraps this.
 */
export default function Loading() {
  return <PixelTransitionOverlay mode="dither" duration="medium" />;
}
