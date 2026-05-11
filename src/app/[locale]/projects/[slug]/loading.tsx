/**
 * Shadow loading boundary — prevents the parent `projects/loading.tsx`
 * curtain from painting on `/projects/[slug]` detail-route navigations.
 * The detail page handles its own progressive reveal via the
 * PixelTransitionOverlay-free ProjectCartridge entrance animation.
 */
export default function Loading() {
  return null;
}
