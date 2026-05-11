import { PixelTransitionOverlay } from "@/components/ui/pixel/pixel-transition-overlay";

/**
 * App Router loading state for /archive. Uses a left-to-right wipe so
 * the gallery's contact-sheet grid reveals across the screen rather
 * than dropping in from the top. Phase 6.
 */
export default function Loading() {
  return <PixelTransitionOverlay mode="wipe-r" duration="medium" />;
}
