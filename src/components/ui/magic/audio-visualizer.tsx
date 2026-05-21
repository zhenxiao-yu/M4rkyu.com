"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { cn } from "@/lib/utils";

// Subtle audio-reactive glow pulse under the navbar — a soft `--ring`
// bloom + crisp edge line that breathe with the music's low-mid energy,
// tapped onto the site player's live Web Audio graph.
//
// Cheap by design: a low-res FFT (128 bins), and per frame just ONE
// analyser read + ONE CSS variable write — no canvas, no per-bar loop,
// no shadowBlur redraws. The glow animates via GPU-composited opacity /
// transform, so there's effectively no paint cost. Color comes from
// `var(--ring)` directly, so theme flips need zero JS. Silent-safe (only
// runs while playing + visible) and reduced-motion-safe (renders nothing,
// nothing blocks the nav).

const FFT_SIZE = 256;

function useGlowPulse(targetRef: React.RefObject<HTMLDivElement | null>) {
  const { audioGraphReady, getAudioGraph, isPlaying } = useAudioPlayer();
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  const shouldRun = Boolean(isPlaying) && visible && !reducedMotion;
  const shouldRunRef = useRef(shouldRun);
  useEffect(() => {
    shouldRunRef.current = shouldRun;
  }, [shouldRun]);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (reducedMotion || !audioGraphReady) return;
    const el = targetRef.current;
    const graph = getAudioGraph();
    if (!el || !graph) return;

    const analyser = graph.ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.85;
    graph.tap.connect(analyser);
    const bins = new Uint8Array(analyser.frequencyBinCount);

    let smoothed = 0;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!shouldRunRef.current) {
        // Ease the glow back to rest when paused/hidden, then idle.
        if (smoothed > 0.002) {
          smoothed *= 0.85;
          el.style.setProperty("--pulse", smoothed.toFixed(3));
        }
        return;
      }
      analyser.getByteFrequencyData(bins);
      // Low-mid band drives the pulse — the part you "feel".
      const lo = 2;
      const hi = Math.min(bins.length, 40);
      let sum = 0;
      for (let i = lo; i < hi; i += 1) sum += bins[i];
      const energy = sum / ((hi - lo) * 255);
      smoothed += (energy - smoothed) * 0.18;
      el.style.setProperty("--pulse", smoothed.toFixed(3));
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      try {
        graph.tap.disconnect(analyser);
      } catch {
        // Graph may already be torn down — nothing to disconnect.
      }
    };
  }, [audioGraphReady, getAudioGraph, targetRef, reducedMotion]);
}

/**
 * Subtle glow-pulse ribbon along the navbar's bottom edge. A soft accent
 * bloom + a crisp hairline that brighten/breathe with the music, full
 * width and end-faded, only visible while playing. Non-intrusive — it
 * never blocks the nav. Mount once inside the header dock.
 */
export function AudioNavBar() {
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const { isPlaying } = useAudioPlayer();
  const reducedMotion = useReducedMotion();
  useGlowPulse(pulseRef);
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-full h-8 overflow-hidden sm:h-10",
        "mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        "transition-opacity duration-500 ease-(--ease-premium)",
        isPlaying && !reducedMotion ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        ref={pulseRef}
        className="absolute inset-x-0 top-0 origin-top"
        style={{ "--pulse": 0 } as CSSProperties}
      >
        {/* Soft bloom — accent gradient fading downward; height + opacity
          * breathe with the pulse (composite-only, no paint). */}
        <div
          className="h-8 w-full bg-[linear-gradient(to_bottom,var(--ring),transparent)] sm:h-10"
          style={{
            opacity: "calc(0.08 + 0.5 * var(--pulse))",
            transform: "scaleY(calc(0.4 + 0.85 * var(--pulse)))",
            transformOrigin: "top",
          }}
        />
        {/* Crisp glowing hairline hugging the nav edge. Static shadow,
          * pulsing opacity (so it composites without repainting). */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-[var(--ring)] shadow-[0_0_10px_var(--ring)]"
          style={{ opacity: "calc(0.4 + 0.6 * var(--pulse))" }}
        />
      </div>
    </div>
  );
}
