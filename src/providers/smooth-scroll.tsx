"use client"

import { useEffect } from "react"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect prefers-reduced-motion: native scroll, no Lenis at all,
    // no RAF loop, no module download.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    let cancelled = false
    let rafId = 0
    let cleanup: (() => void) | null = null

    // Dynamic import keeps the Lenis chunk out of the initial JS bundle
    // — the browser requests it only after hydration, off the critical
    // path. The cancellation latch covers the StrictMode double-mount.
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      })

      function raf(time: number) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
      cleanup = () => {
        lenis.destroy()
        cancelAnimationFrame(rafId)
      }
    })

    return () => {
      cancelled = true
      if (cleanup) cleanup()
    }
  }, [])

  return <>{children}</>
}
