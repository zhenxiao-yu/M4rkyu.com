"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Tiny client island that mirrors the current pathname onto a
 * `data-route` attribute on `<html>`. The per-route View Transition
 * keyframes in `globals.css` key off this attribute to apply
 * different reveals on different pages (e.g. `[data-route="work"]
 * ::view-transition-new(root)` gets the deck reveal).
 *
 * The first segment of the pathname (after the locale prefix) is
 * what we emit, normalized:
 *   /en          → "home"
 *   /en/work     → "work"
 *   /zh/work/abc → "work"
 *   /en/archive  → "archive"
 *
 * Sets nothing on the server — the attribute starts unset and is
 * written in `useEffect`. CSS that needs an "initial" route value
 * should not rely on it during SSR.
 */
export function RouteAttribute() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.replace(/^\/+/, "").split("/");
    const route = segments[0] || "home";
    document.documentElement.dataset.route = route;
    return () => {
      // Don't reset on unmount — the next route's effect overwrites
      // it. Clearing here causes a frame of no attribute on
      // back/forward.
    };
  }, [pathname]);

  return null;
}
