"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * `next/image` wrapper that rises the photo out of a placeholder instead of
 * letting it pop in.
 *
 * Most portfolio covers/posters are dynamic/remote URLs from `src/content`,
 * so Next can't auto-generate a `blurDataURL`. Rather than add a build-time
 * LQIP pipeline, we ride the `onLoad` event: the image starts blurred +
 * slightly scaled + `opacity-0` and settles to sharp + visible once decoded.
 * Whatever surface sits behind it (these tiles already use `bg-muted`/
 * `bg-card`) shows through during the load, so there's a calm placeholder,
 * never a flash.
 *
 * When a real `blurDataURL` exists (gallery uploads carry one), it's passed
 * straight through to next/image's native `placeholder="blur"`. In that case
 * we let the native LQIP do the placeholder work and only fade opacity — no
 * extra CSS blur/scale layered on top, since the real low-res preview is
 * already the better placeholder.
 *
 * Why a CSS *animation* (not a Tailwind `transition`): callers also animate
 * grayscale/scale/transform on hover via their own `transition` utility, and
 * tailwind-merge collapses `transition-property` to a single value — so a
 * transition-based fade here would either clobber, or be clobbered by, the
 * caller's hover transition. The rise is driven by the `--blur-image-rise*`
 * keyframes in globals.css, keyed off `data-loaded`, which is fully
 * independent of the `transition` property. Hover transitions stay intact.
 *
 * Reduced motion: the rise is skipped entirely — the image just appears. The
 * global `prefers-reduced-motion` guard in globals.css also neutralizes any
 * keyframe duration as a second line of defence. Dimensions, `src`, `alt`,
 * and `sizes` are forwarded untouched, so this never introduces layout shift.
 */
interface BlurImageProps extends ImageProps {
  /**
   * Force the opacity-only fade and skip the blur+scale rise. Use when the
   * element's `transform` is load-bearing elsewhere (e.g. the lightbox's
   * pinch/zoom inline transform), since the rise keyframe animates `transform`
   * and would briefly fight it during load.
   */
  fadeOnly?: boolean;
}

export function BlurImage({
  className,
  onLoad,
  placeholder,
  fadeOnly = false,
  alt,
  ...props
}: BlurImageProps) {
  const reduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const animate = !reduceMotion;
  // A native LQIP is already showing through, so don't stack a CSS blur on
  // top of it — fade opacity only. Without a blurDataURL the box shows its
  // `bg-muted` substrate, so we blur-and-rise for a softer arrival. `fadeOnly`
  // forces the same opacity-only path when the caller owns `transform`.
  const hasNativeBlur = placeholder === "blur" || fadeOnly;

  return (
    <Image
      {...props}
      alt={alt}
      placeholder={placeholder}
      // `data-blur-image` selects the rise (blur+scale+fade) or plain fade
      // variant; `data-loaded` flips the keyframe on once decoded. The whole
      // treatment lives in globals.css under these attribute selectors, so it
      // never collides with the caller's Tailwind hover `transition`. When
      // reduced motion is on we drop the attribute entirely — the image just
      // appears at full opacity with no initial hidden state.
      data-blur-image={animate ? (hasNativeBlur ? "fade" : "rise") : undefined}
      data-loaded={loaded ? "" : undefined}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={className}
    />
  );
}
