"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Home routes mount their own Lenis + GSAP ScrollTrigger via
// HomeSmoothScroll. Skip the site-wide instance there to avoid two
// Lenis loops fighting over the same wheel events. next-intl uses
// `localePrefix: "always"`, so the home paths are the bare locale roots.
const HOME_PATHS = new Set(["/", "/en", "/zh"]);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect prefers-reduced-motion: native scroll, no Lenis at all,
    // no RAF loop, no module download.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Avoid double-mount on the home route.
    if (HOME_PATHS.has(pathname)) return;

    let cancelled = false;
    let rafId = 0;
    let cleanup: (() => void) | null = null;

    // Dynamic import keeps the Lenis chunk out of the initial JS bundle.
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Re-measure when the document height changes. Lenis caches the
      // scrollable distance at init; long blog articles (images
      // loading, MDX widgets hydrating, fonts swapping) make the page
      // taller after first paint, so the wheel "hits bottom" before
      // it actually has. ResizeObserver on <body> catches every
      // height delta, lenis.resize() updates the scroll bounds.
      const resizeObserver = new ResizeObserver(() => lenis.resize());
      resizeObserver.observe(document.body);
      resizeObserver.observe(document.documentElement);

      // Pause Lenis whenever a dialog overlay is open. Without this,
      // the wheel handler keeps animating <body>'s transform behind
      // the modal — same leak the home route already handled.
      const syncDialog = () => {
        const open = !!document.querySelector(
          '.m4-dialog-overlay[data-state="open"]',
        );
        if (open) lenis.stop();
        else lenis.start();
      };
      const dialogObserver = new MutationObserver(syncDialog);
      dialogObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state"],
      });
      syncDialog();

      cleanup = () => {
        lenis.destroy();
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        dialogObserver.disconnect();
      };
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [pathname]);

  return <>{children}</>;
}
