import * as React from "react";
import { cn } from "@/lib/utils";

type Mode = "dither" | "wipe-l" | "wipe-r";
type Duration = "medium" | "slow" | "cinematic";

const ANIMATION_NAME: Record<Mode, string> = {
  dither: "pixel-curtain-down",
  "wipe-l": "pixel-curtain-wipe-l",
  "wipe-r": "pixel-curtain-wipe-r",
};

const DURATION_VAR: Record<Duration, string> = {
  medium: "var(--motion-medium)",
  slow: "var(--motion-slow)",
  cinematic: "var(--motion-cinematic)",
};

interface PixelTransitionOverlayProps {
  /** Direction of the curtain reveal. Defaults to `"dither"` (top-down). */
  mode?: Mode;
  /** Duration token. Defaults to `"medium"` (--motion-medium / 280ms). */
  duration?: Duration;
  className?: string;
}

/**
 * Fixed-position scene-change curtain. Drop it into a Next App Router
 * `loading.tsx` to paint a stepped reveal while the next route prepares.
 * Uses keyframes from `globals.css` + the Phase-1 `--ease-pixel-step`
 * easing token; the curtain is `pointer-events-none` and `aria-hidden`
 * so it never traps focus or steals clicks.
 *
 * Reduced-motion: the universal `transition-duration` / `animation-duration`
 * override in globals.css collapses the curtain to a 1ms no-op, matching
 * the §4.9 a11y spec without requiring an inline `useReducedMotion` check.
 */
export function PixelTransitionOverlay({
  mode = "dither",
  duration = "medium",
  className,
}: PixelTransitionOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-40 overflow-hidden",
        className,
      )}
    >
      {/* Inline `style.animation` (rather than a Tailwind utility class)
        * because Tailwind v4's `animate-[name_duration_ease]` arbitrary
        * value syntax cannot reference CSS variables in the duration
        * slot — and we want the curtain to inherit `--motion-medium /
        * slow / cinematic` from the theme rather than hardcoding ms. */}
      <div
        className="absolute inset-0 bg-background"
        style={{
          animation: `${ANIMATION_NAME[mode]} ${DURATION_VAR[duration]} var(--ease-pixel-step) both`,
        }}
      />
    </div>
  );
}
