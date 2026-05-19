"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface GhostedWordProps {
  /** The word to ghost. Single token preferred. */
  text: string;
  /** Number of ghost duplicates. Default 6 + the original = 7 total layers. */
  ghosts?: number;
  /** Max horizontal pull in px. Default 18. */
  spread?: number;
  className?: string;
}

// Stacked duplicate spans drift on cursor x. Reduced-motion + touch = base word only.
export function GhostedWord({
  text,
  ghosts = 6,
  spread = 18,
  className,
}: GhostedWordProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [pull, setPull] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // GhostedWord lives in the footer wordmark which is below the
    // fold on every page. Gating the pointermove listener via
    // IntersectionObserver + throttling state updates to rAF keeps
    // this from re-rendering 7 ghost spans per pointer move on every
    // route. The cost off-screen is now zero.
    let attached = false;
    let pending = false;
    let lastX = 0;

    function update() {
      pending = false;
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const dx = (lastX - cx) / (window.innerWidth / 2);
      setPull(Math.max(-1, Math.min(1, dx)));
    }

    function onMove(event: PointerEvent) {
      lastX = event.clientX;
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }

    function attach() {
      if (attached) return;
      window.addEventListener("pointermove", onMove, { passive: true });
      attached = true;
    }

    function detach() {
      if (!attached) return;
      window.removeEventListener("pointermove", onMove);
      attached = false;
      setPull(0);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attach();
        else detach();
      },
      { threshold: 0 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      detach();
    };
  }, [reduce]);

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={cn("relative inline-block", className)} aria-label={text}>
      <span aria-hidden="true" className="invisible">{text}</span>
      {Array.from({ length: ghosts }).map((_, i) => {
        const t = (i + 1) / ghosts;
        const offset = pull * spread * t;
        const opacity = 0.08 + (1 - t) * 0.14;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 inline-block whitespace-nowrap transition-transform duration-(--motion-fast) ease-(--ease-premium)"
            style={{
              transform: `translate3d(${offset.toFixed(2)}px, 0, 0)`,
              opacity,
            }}
          >
            {text}
          </span>
        );
      })}
      <span className="absolute inset-0 inline-block">{text}</span>
    </span>
  );
}
