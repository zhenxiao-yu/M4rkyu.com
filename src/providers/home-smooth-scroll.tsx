"use client";

import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, registerScrollTrigger } from "@/lib/gsap";
import { registerSpineLenis, scrollSpine } from "@/lib/home-spine";

interface HomeSmoothScrollProps {
  children: ReactNode;
}

/**
 * Home-only smooth scroll + GSAP ScrollTrigger bootstrap.
 *
 *   - Lenis: lerps wheel/touch into a smooth scroll velocity.
 *   - ScrollTrigger: lazy-registered for future scroll-tied effects.
 *     Bridges Lenis' raf into `gsap.ticker` so scrubbed timelines
 *     read the lerped scroll position.
 *   - Reduced-motion + coarse-pointer: skips Lenis entirely (native
 *     scroll, no scrub).
 *   - Lenis is paused whenever a dialog overlay opens so the modal's
 *     own scroll lock isn't undone by Lenis still hijacking wheel
 *     events on the page underneath.
 *
 * Full-page slide snapping:
 *   - Desktop (pointer:fine): Lenis' `Snap` plugin snaps each
 *     `[data-snap="section"]` start to the viewport top. `proximity`
 *     (not `mandatory`) is deliberate — mandatory yanked the scroll
 *     back to a boundary the user had intentionally passed, and traps
 *     sections taller than the viewport. Proximity only tidies up near
 *     a boundary, so tall sections stay fully readable.
 *   - Mobile / coarse pointer: Lenis is skipped, so native CSS
 *     scroll-snap drives the slides (see `globals.css`, gated on
 *     `html[data-home-snap]` + `(pointer: coarse)`).
 *   - Reduced motion: no snap on either path (the `data-home-snap`
 *     flag is never set and Lenis never mounts).
 *
 * Mount once at the top of `src/app/[locale]/page.tsx` — never on
 * other routes.
 */
export function HomeSmoothScroll({ children }: HomeSmoothScrollProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;

    // Marks the home route + enables the coarse-pointer CSS snap
    // fallback in globals.css. Set for both pointer types; removed on
    // unmount so other routes never inherit the snap container.
    const root = document.documentElement;
    root.setAttribute("data-home-snap", "");

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      // Touch devices use native CSS scroll-snap (cheaper, no scroll
      // hijack). Lenis + the JS Snap plugin stay off here.
      return () => root.removeAttribute("data-home-snap");
    }

    let cancelled = false;
    let lenisInstance: {
      destroy: () => void;
      raf: (t: number) => void;
      stop: () => void;
      start: () => void;
      resize: () => void;
    } | null = null;
    let snapInstance: {
      destroy: () => void;
      resize: () => void;
      stop: () => void;
      start: () => void;
    } | null = null;
    let scrollTriggerRef:
      | typeof import("gsap/ScrollTrigger").ScrollTrigger
      | null = null;
    let dialogObserver: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      const [{ default: Lenis }, { default: Snap }, ST] = await Promise.all([
        import("lenis"),
        import("lenis/snap"),
        registerScrollTrigger(),
      ]);
      if (cancelled) return;

      // Snappier than Lenis defaults — 0.85s with steep ease-out so
      // wheel events feel responsive rather than draggy.
      const lenis = new Lenis({
        duration: 0.85,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.5,
      });
      lenisInstance = lenis;
      // Hand the instance to the spine helper so the hero cue + keyboard
      // paging scroll through Lenis instead of fighting its loop.
      registerSpineLenis(lenis);

      function rafBridge(time: number) {
        lenisInstance?.raf(time * 1000);
      }
      gsap.ticker.add(rafBridge);
      gsap.ticker.lagSmoothing(0);

      scrollTriggerRef = ST;
      ST?.refresh();

      // Full-page slide snapping. `proximity` so a slow stop near a
      // boundary lands cleanly on a slide, but mid-section dwelling on
      // content taller than the viewport is never yanked away.
      const snap = new Snap(lenis, {
        type: "proximity",
        duration: 0.8,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-snap='section']"),
      );
      if (sections.length > 0) snap.addElements(sections, { align: "start" });
      snapInstance = snap;

      // Re-measure Lenis + Snap + ScrollTrigger when document height
      // changes. Without this, content that grows after mount (images,
      // fonts, dynamic sections) leaves stale scroll limits / snap
      // offsets — the wheel bottoms out early and slides snap to the
      // wrong place.
      resizeObserver = new ResizeObserver(() => {
        lenisInstance?.resize();
        snapInstance?.resize();
        scrollTriggerRef?.refresh();
      });
      resizeObserver.observe(document.body);
      resizeObserver.observe(document.documentElement);

      // Pause Lenis + Snap whenever a dialog overlay is mounted+open.
      // Without this, Lenis keeps intercepting wheel events and the
      // page behind the modal visibly scrolls even though our explicit
      // body lock pinned `position: fixed`. Resume when the last
      // overlay unmounts.
      const sync = () => {
        if (!lenisInstance) return;
        const anyOpen = !!document.querySelector(
          '.m4-dialog-overlay[data-state="open"]',
        );
        if (anyOpen) {
          lenisInstance.stop();
          snapInstance?.stop();
        } else {
          lenisInstance.start();
          snapInstance?.start();
        }
      };
      dialogObserver = new MutationObserver(sync);
      dialogObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state"],
      });
      sync();
    })();

    return () => {
      cancelled = true;
      root.removeAttribute("data-home-snap");
      registerSpineLenis(null);
      dialogObserver?.disconnect();
      resizeObserver?.disconnect();
      snapInstance?.destroy();
      lenisInstance?.destroy();
      scrollTriggerRef?.killAll();
    };
  }, [reduce]);

  // Keyboard section paging — PageDown / PageUp jump to the next /
  // previous snap slide across the whole spine (the "next or previous
  // page" controls). Works on every path: the helper routes through
  // Lenis when present and native scroll otherwise. Ignored while typing
  // or with a dialog open so it never hijacks form / modal navigation.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "PageDown" && event.key !== "PageUp") return;
      const el = event.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT")
      ) {
        return;
      }
      if (document.querySelector('.m4-dialog-overlay[data-state="open"]')) return;
      event.preventDefault();
      scrollSpine(event.key === "PageDown" ? 1 : -1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <>{children}</>;
}
