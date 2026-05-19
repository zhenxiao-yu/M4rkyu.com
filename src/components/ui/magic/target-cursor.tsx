"use client";

// Adapted from reactbits.dev (MIT)
// Source: https://reactbits.dev/animations/target-cursor
//
// Same algorithm as upstream: a spinning reticle follows the pointer,
// then on hover of any element matching `targetSelector` the four
// corners snap to the target's bounding rect via GSAP tweens. We
// add the site-wide gates — `useReducedMotion`, `(pointer: fine)` —
// so touch and reduced-motion users keep the native cursor instead
// of a hidden body cursor + invisible reticle.

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

export interface TargetCursorProps {
  /** CSS selector for elements that should snap the reticle. */
  targetSelector?: string;
  /** Seconds per full rotation when idle. */
  spinDuration?: number;
  /** When false, leaves the native body cursor visible. */
  hideDefaultCursor?: boolean;
  /** Seconds for the corner snap-in tween. */
  hoverDuration?: number;
  /** When true, the snapped corners gently parallax with the cursor. */
  parallaxOn?: boolean;
}

// Defaults to the tight bento-tile selector. Consumers can widen the
// scope explicitly, but the safer default keeps the reticle from
// hijacking page-wide cursors when this component is mounted without
// thinking. `hideDefaultCursor` also defaults to false now — the
// reticle is an accent that rides *alongside* the native cursor, not
// a replacement.
const DEFAULT_SELECTOR = "[data-bento-tile]";

export function TargetCursor({
  targetSelector = DEFAULT_SELECTOR,
  spinDuration = 2,
  hideDefaultCursor = false,
  hoverDuration = 0.2,
  parallaxOn = true,
}: TargetCursorProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<
    { x: number; y: number }[] | null
  >(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  const reduceMotion = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");
  const enabled = !reduceMotion && finePointer;

  const constants = useMemo(
    () => ({ borderWidth: 3, cornerSize: 12 }),
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    // Snapshot the strength sentinel up-front so the cleanup
    // branch isn't reading `.current` after a re-render swapped
    // the underlying object (the linter's reason for the warning).
    const strengthSentinel = activeStrengthRef.current;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = "none";
    }

    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>(
      ".target-cursor-corner",
    );

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) {
        target.removeEventListener("mouseleave", currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const createSpinTimeline = () => {
      spinTl.current?.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, {
          rotation: "+=360",
          duration: spinDuration,
          ease: "none",
        });
    };

    createSpinTimeline();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cornersRef.current) return;
      const strength = strengthSentinel.current;
      if (strength === 0) return;
      const cursorX = gsap.getProperty(cursor, "x") as number;
      const cursorY = gsap.getProperty(cursor, "y") as number;
      const corners = Array.from(cornersRef.current);
      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, "x") as number;
        const currentY = gsap.getProperty(corner, "y") as number;
        const targetX =
          targetCornerPositionsRef.current![i].x - cursorX;
        const targetY =
          targetCornerPositionsRef.current![i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration =
          strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration,
          ease: duration === 0 ? "none" : "power1.out",
          overwrite: "auto",
        });
      });
    };
    tickerFnRef.current = tickerFn;

    const moveCursor = (x: number, y: number) => {
      gsap.to(cursor, { x, y, duration: 0.1, ease: "power3.out" });
    };

    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", moveHandler);

    const scrollHandler = () => {
      if (!activeTarget) return;
      const mouseX = gsap.getProperty(cursor, "x") as number;
      const mouseY = gsap.getProperty(cursor, "y") as number;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget ||
          elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) {
        currentLeaveHandler?.();
      }
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    };
    const mouseUpHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };
    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    const enterHandler = (e: MouseEvent) => {
      const directTarget = e.target as Element | null;
      if (!directTarget || !cornersRef.current) return;
      // Walk up the DOM, collecting matching ancestors. We use the
      // closest match so nested links/buttons still snap to the
      // tightest one.
      const allTargets: Element[] = [];
      let current: Element | null = directTarget;
      while (current && current !== document.body) {
        if (current.matches?.(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] ?? null;
      if (!target) return;
      if (activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);

      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach((corner) => gsap.killTweensOf(corner));
      gsap.killTweensOf(cursor, "rotation");
      spinTl.current?.pause();
      gsap.set(cursor, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = gsap.getProperty(cursor, "x") as number;
      const cursorY = gsap.getProperty(cursor, "y") as number;

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        {
          x: rect.right + borderWidth - cornerSize,
          y: rect.top - borderWidth,
        },
        {
          x: rect.right + borderWidth - cornerSize,
          y: rect.bottom + borderWidth - cornerSize,
        },
        {
          x: rect.left - borderWidth,
          y: rect.bottom + borderWidth - cornerSize,
        },
      ];

      isActiveRef.current = true;
      if (tickerFnRef.current) {
        gsap.ticker.add(tickerFnRef.current);
      }

      gsap.to(strengthSentinel, {
        current: 1,
        duration: hoverDuration,
        ease: "power2.out",
      });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cursorX,
          y: targetCornerPositionsRef.current![i].y - cursorY,
          duration: 0.2,
          ease: "power2.out",
        });
      });

      const leaveHandler = () => {
        if (tickerFnRef.current) {
          gsap.ticker.remove(tickerFnRef.current);
        }
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(strengthSentinel, {
          current: 0,
          overwrite: true,
        });
        activeTarget = null;
        if (cornersRef.current) {
          const localCorners = Array.from(cornersRef.current);
          gsap.killTweensOf(localCorners);
          const { cornerSize: cs } = constants;
          const positions = [
            { x: -cs * 1.5, y: -cs * 1.5 },
            { x: cs * 0.5, y: -cs * 1.5 },
            { x: cs * 0.5, y: cs * 0.5 },
            { x: -cs * 1.5, y: cs * 0.5 },
          ];
          const tl = gsap.timeline();
          localCorners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: "power3.out",
              },
              0,
            );
          });
        }
        resumeTimeout = setTimeout(() => {
          if (!activeTarget && spinTl.current) {
            const currentRotation = gsap.getProperty(
              cursor,
              "rotation",
            ) as number;
            const normalizedRotation = currentRotation % 360;
            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursor, {
                rotation: "+=360",
                duration: spinDuration,
                ease: "none",
              });
            gsap.to(cursor, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: "none",
              onComplete: () => {
                spinTl.current?.restart();
              },
            });
          }
          resumeTimeout = null;
        }, 50);
        cleanupTarget(target);
      };
      currentLeaveHandler = leaveHandler;
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mouseover", enterHandler as EventListener);

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler as EventListener);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      spinTl.current = null;
      document.body.style.cursor = originalCursor;
      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      // Use the effect-scoped snapshot taken at mount time. This
      // sidesteps the react-hooks/exhaustive-deps "ref changed by
      // cleanup" warning — it's a plain `{ current: number }`
      // sentinel, not a DOM node we'd want to re-read.
      strengthSentinel.current = 0;
    };
  }, [
    enabled,
    targetSelector,
    spinDuration,
    hideDefaultCursor,
    hoverDuration,
    parallaxOn,
    constants,
  ]);

  if (!enabled) return null;

  // Reticle markup. CSS lives inline as a single <style> block so we
  // don't ship a sibling stylesheet just for four corners.
  return (
    <>
      <style>{TARGET_CURSOR_CSS}</style>
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="target-cursor-wrapper"
      >
        <div ref={dotRef} className="target-cursor-dot" />
        <div className="target-cursor-corner corner-tl" />
        <div className="target-cursor-corner corner-tr" />
        <div className="target-cursor-corner corner-br" />
        <div className="target-cursor-corner corner-bl" />
      </div>
    </>
  );
}

// Scoped reticle styles. Colors derive from `--ring` (the single
// accent token) so the cursor tracks light/dark theme without extra
// JS. mix-blend-difference keeps the dot legible on both light card
// surfaces and dark backdrops.
const TARGET_CURSOR_CSS = `
.target-cursor-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  will-change: transform;
}
.target-cursor-dot {
  position: absolute;
  left: -3px;
  top: -3px;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--ring);
  transform-origin: center;
}
.target-cursor-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 3px solid var(--ring);
  background: transparent;
}
.target-cursor-corner.corner-tl {
  left: -18px;
  top: -18px;
  border-right: none;
  border-bottom: none;
}
.target-cursor-corner.corner-tr {
  left: 6px;
  top: -18px;
  border-left: none;
  border-bottom: none;
}
.target-cursor-corner.corner-br {
  left: 6px;
  top: 6px;
  border-left: none;
  border-top: none;
}
.target-cursor-corner.corner-bl {
  left: -18px;
  top: 6px;
  border-right: none;
  border-top: none;
}
`;

export default TargetCursor;
