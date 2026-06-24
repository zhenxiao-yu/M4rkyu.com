"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { Waves } from "@/components/ui/magic/waves";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

// The three.js scene is fetched only when this resolves — and it only
// renders on fine-pointer, motion-OK clients (see the gate below), so
// phones and reduced-motion visitors never download the chunk and never
// pay the GPU cost. `ssr: false` keeps the WebGL canvas out of the server
// render; the Waves field below is the stable markup underneath it.
const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => ({ default: m.HeroScene })),
  { ssr: false },
);

/**
 * Contains a WebGL failure (blocklisted GPU, exhausted context pool, lost
 * context) to the decorative field alone. On error it renders nothing, so
 * the Waves floor below stays the hero — the page never falls through to
 * the route-level error screen because of a background effect.
 */
class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Hero backdrop — the always-on 2-D Perlin Waves floor plus, on capable
 * desktops, the Three.js contour field layered above it. When the 3-D
 * field activates the Waves recede to a faint substrate (a slow opacity
 * cross-fade), so the stage gains depth without ever showing two
 * competing line fields at full strength. The "calm, mostly-empty stage"
 * still holds.
 */
export function HeroBackdrop() {
  const reduced = useReducedMotion();
  // serverFallback false → SSR + first paint render the Waves-only floor;
  // a fine pointer is confirmed after hydration, which is also what
  // triggers the lazy scene import.
  const finePointer = useMediaQuery("(pointer: fine)", false);
  const enable3d = !reduced && finePointer;
  // The field only counts as present once it has actually mounted and
  // begun its reveal. Until then — chunk still downloading, or WebGL
  // failed — the Waves stay at full strength, so the hero is never a
  // dimmed-but-empty stage during the lazy load.
  const [sceneReady, setSceneReady] = useState(false);
  const handleReady = useCallback(() => setSceneReady(true), []);

  return (
    <>
      <Waves
        className={cn(
          "transition-opacity duration-(--motion-cinematic) ease-(--ease-premium) motion-reduce:transition-none",
          enable3d && sceneReady
            ? "opacity-[0.22] dark:opacity-[0.2]"
            : "opacity-[0.62] dark:opacity-[0.56]",
        )}
        xGap={30}
        yGap={38}
        waveAmpX={20}
        waveAmpY={11}
        touchImpulse
      />
      {enable3d ? (
        <SceneErrorBoundary>
          <HeroScene onReady={handleReady} />
        </SceneErrorBoundary>
      ) : null}
    </>
  );
}
