"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps page content in a 150ms opacity + 8px y-offset entry
 * animation keyed by `usePathname()`. Each route mount re-runs the
 * animation — there is no exit animation because the App Router
 * does not surface unmount cleanly without complex layout
 * choreography. Entry-only is honest.
 *
 * Short-circuits to the unwrapped children when `useReducedMotion()`
 * returns true.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      // Cubic-bezier mirrors --ease-premium; motion's transition.ease cannot read CSS variables.
      transition={{ duration: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
