"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(FINE_POINTER_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function readFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function serverSnapshot() {
  return false;
}

/**
 * Site-wide custom cursor follower. Two layers:
 *
 *   - A small dot that tracks the pointer exactly.
 *   - A larger ring that trails the pointer with eased lerping.
 *
 * Native cursor stays visible (we don't `cursor: none` the body) so
 * accessibility tooling, click-target affordances, and form inputs
 * behave normally. The follower is purely decorative: aria-hidden,
 * pointer-events: none, hidden under reduced-motion + on coarse
 * pointers (touch). Pointer-type detection is via `useSyncExternalStore`
 * so the SSR snapshot is stable and there's no setState-in-effect.
 *
 * Hover detection: when the pointer is over an `<a>`, `<button>`,
 * `[role=button]`, `[data-cursor=link]`, the ring scales up and
 * adopts the ring-cyan token.
 */
export function MouseFollower() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    readFinePointer,
    serverSnapshot,
  );
  const enabled = !reduce && finePointer;

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let hovering = false;
    let raf = 0;

    function onPointerMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
    }

    function isInteractive(el: Element | null): boolean {
      while (el && el !== document.documentElement) {
        if (
          el.matches?.("a, button, [role='button'], [data-cursor='link'], input, textarea, select")
        ) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    function onPointerOver(event: PointerEvent) {
      hovering = isInteractive(event.target as Element);
      ring!.dataset.state = hovering ? "hover" : "idle";
    }

    function loop() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      dot!.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      ring!.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-80 size-1.5 rounded-full bg-foreground mix-blend-difference"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      <div
        ref={ringRef}
        data-state="idle"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-80 size-8 rounded-full border border-foreground/40 mix-blend-difference transition-[width,height,border-color,transform] duration-(--motion-fast) ease-(--ease-premium) data-[state=hover]:size-12 data-[state=hover]:border-ring data-[state=hover]:bg-ring/15"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
