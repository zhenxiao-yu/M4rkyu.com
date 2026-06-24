"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

/**
 * CursorReticle — the site-wide targeting-computer cursor.
 *
 * A faint four-corner reticle rides the pointer; when it crosses an
 * interactive target it **locks on**, the brackets gliding out to enclose the
 * element (just outside its bounds) and brightening to the accent ink. It's
 * the literal targeting language of the always-on CRT boot sequence, so the
 * whole site reads as one continuous terminal session.
 *
 * Design posture (from an adversarial design review):
 *  - ADDITIVE — never hides the native cursor; this is decoration + wayfinding,
 *    aria-hidden + pointer-events:none, so clicks/hit-areas/AT are untouched.
 *  - One confident gesture — no mix-blend "loupe", no VT323 caption pills, no
 *    magnetic element-translation (all judged try-hard for a personal archive).
 *    The lock-on brackets are the single signature; ClickSpark keeps owning the
 *    click ripple + hover ink-halo, so the two layers never sum into a blob
 *    (the brackets sit OUTSIDE the element; the halo is a soft fill at the
 *    cursor — visually distinct).
 *  - Replaces the old global CursorTrail (a mix-blend-difference dot trail —
 *    the "floating artifact" treatment the polish pass already retired).
 *
 * Perf: one rAF loop, transforms only (translate3d, no layout), all state in
 * refs (zero per-frame React render), passive listeners. Target detection is
 * delegated `pointerover` (fires on element-boundary crossings, not per pixel)
 * — it does NOT duplicate ClickSpark's per-frame elementFromPoint.
 *
 * Fully inert on touch / coarse pointers and under reduced motion (renders
 * null after the client gate, so there is no SSR paint to mismatch). Hides
 * itself whenever a modal/⌘K palette is open (`body[data-scroll-locked]`),
 * which also keeps it from ever painting over a dialog at its z-index.
 */

// Lock onto genuine affordances; deliberately exclude form fields so a text
// caret/I-beam is never boxed. `[data-cursor-lock]` is an explicit opt-in.
const SELECTOR =
  'a[href], button:not([disabled]), [role="button"], [data-card-link], summary, [data-cursor-lock]';

const ARM = 14; // bracket arm length (px)
const PAD = 6; // gap between the brackets and the locked element
const FREE = 11; // half-size of the small free-floating reticle square
const BOX_EASE = 0.24; // how fast the brackets glide toward their target
const ALPHA_EASE = 0.2;
const ALPHA_FREE = 0.4; // quiet when just riding the pointer
const ALPHA_LOCK = 1; // bold on a target

type Box = { l: number; t: number; r: number; b: number };

export function CursorReticle() {
  // useMediaQuery is SSR-safe (useSyncExternalStore): the server snapshot is
  // false, so the layer renders null on the server and the first hydration
  // render, then lights up on a real fine pointer — no mounted flag, no
  // setState-in-effect, no hydration mismatch.
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduce = useReducedMotion();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cornerRefs = useRef<Array<HTMLSpanElement | null>>([null, null, null, null]);

  const active = Boolean(finePointer) && !reduce;

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    const corners = cornerRefs.current;
    if (!root || corners.some((c) => !c)) return;

    // Raw pointer + lock state live in closures/refs — never React state.
    const pointer = { x: -300, y: -300 };
    let target: Element | null = null;
    let rect: DOMRect | null = null;
    let modalOpen = document.body.hasAttribute("data-scroll-locked");
    let visible = false;

    // Animated box (lerps toward the target box) + alpha.
    const box: Box = { l: -300, t: -300, r: -300, b: -300 };
    let alpha = 0;

    const readRect = () => {
      if (target && target.isConnected) rect = target.getBoundingClientRect();
      else {
        target = null;
        rect = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      visible = true;
    };
    const onOver = (e: PointerEvent) => {
      const el =
        e.target instanceof Element ? e.target.closest(SELECTOR) : null;
      if (el !== target) {
        target = el;
        readRect();
      }
    };
    const onLeaveWindow = () => {
      visible = false;
    };
    const onScrollOrResize = () => {
      if (target) readRect();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("blur", onLeaveWindow);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    // Watch for modal / ⌘K palette open (react-remove-scroll locks the body).
    const bodyObserver = new MutationObserver(() => {
      modalOpen = document.body.hasAttribute("data-scroll-locked");
    });
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked"],
    });

    const lerp = (a: number, b: number, e: number) => a + (b - a) * e;
    let raf = 0;

    const tick = () => {
      // Drop the lock if the target left the DOM mid-navigation.
      if (target && !target.isConnected) {
        target = null;
        rect = null;
      }

      const locked = Boolean(rect);
      const targetAlpha =
        !visible || modalOpen ? 0 : locked ? ALPHA_LOCK : ALPHA_FREE;

      // Target box: the locked element's rect (padded out), or a small square
      // riding the pointer when free.
      let tl: number, tt: number, tr: number, tb: number;
      if (locked && rect) {
        tl = rect.left - PAD;
        tt = rect.top - PAD;
        tr = rect.right + PAD;
        tb = rect.bottom + PAD;
      } else {
        tl = pointer.x - FREE;
        tt = pointer.y - FREE;
        tr = pointer.x + FREE;
        tb = pointer.y + FREE;
      }

      // Snap (don't glide) when fading in from parked, so it doesn't streak
      // across the screen from its last position.
      const e = alpha < 0.02 ? 1 : BOX_EASE;
      box.l = lerp(box.l, tl, e);
      box.t = lerp(box.t, tt, e);
      box.r = lerp(box.r, tr, e);
      box.b = lerp(box.b, tb, e);
      alpha = lerp(alpha, targetAlpha, ALPHA_EASE);

      root.style.opacity = alpha.toFixed(3);

      // Four corners: TL, TR, BL, BR (indices 0..3).
      const xs = [box.l, box.r - ARM, box.l, box.r - ARM];
      const ys = [box.t, box.t, box.b - ARM, box.b - ARM];
      for (let i = 0; i < 4; i++) {
        corners[i]!.style.transform = `translate3d(${xs[i].toFixed(2)}px, ${ys[i].toFixed(2)}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("blur", onLeaveWindow);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      bodyObserver.disconnect();
    };
  }, [active]);

  if (!active) return null;

  // Each corner is an L: two 1.5px --ring edges, glowing in --terminal-glow.
  const base: CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    width: ARM,
    height: ARM,
    borderColor: "var(--ring)",
    borderStyle: "solid",
    filter: "drop-shadow(0 0 4px var(--terminal-glow))",
    willChange: "transform",
  };
  const sides: CSSProperties[] = [
    { borderWidth: "1.5px 0 0 1.5px" }, // TL
    { borderWidth: "1.5px 1.5px 0 0" }, // TR
    { borderWidth: "0 0 1.5px 1.5px" }, // BL
    { borderWidth: "0 1.5px 1.5px 0" }, // BR
  ];

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-70 opacity-0"
    >
      {sides.map((s, i) => (
        <span
          key={i}
          ref={(el) => {
            cornerRefs.current[i] = el;
          }}
          style={{ ...base, ...s }}
        />
      ))}
    </div>
  );
}
