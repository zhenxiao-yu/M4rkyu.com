"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface PillNavItem {
  label: string;
  /** Locale-relative href used by next-intl Link (e.g. "/work"). */
  href: string;
  /** Optional regex override for "active" detection on the pathname. */
  matchPattern?: RegExp;
}

export interface PillNavProps {
  items: PillNavItem[];
  /** Stagger items into view on mount. Defaults to true. */
  initialLoadAnimation?: boolean;
  className?: string;
}

const ACTIVE_PILL_LAYOUT_ID = "pill-nav-active-pill";

/**
 * PillNav — clean horizontal pill navigation with a single sliding
 * indicator that morphs between items via motion's `layoutId` shared
 * layout transition. Active state is driven by the current pathname
 * so the pill snaps to the right item on first paint and after any
 * route change (cmd-k included).
 *
 * Compared to the GooeyNav this replaces:
 *   - No SVG goo filter, no particle bursts — the focus is the slide.
 *   - One transitioning element instead of three (filter + text + ul).
 *   - Theme-correct out of the box; no per-mode blend-mode tuning.
 *
 * Reduced-motion: the active pill snaps instantly; entrance stagger
 * is suppressed.
 */
export function PillNav({
  items,
  initialLoadAnimation = true,
  className,
}: PillNavProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Longest-prefix wins so that nested routes (e.g. `/work/foo`) keep
  // highlighting their parent in the dock.
  const activeIndex = useMemo(() => {
    let best = 0;
    let bestLen = -1;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]!;
      const matches = item.matchPattern
        ? item.matchPattern.test(pathname)
        : pathname === item.href || pathname.startsWith(item.href + "/");
      if (matches && item.href.length > bestLen) {
        best = i;
        bestLen = item.href.length;
      }
    }
    return best;
  }, [items, pathname]);

  const stagger = initialLoadAnimation && !reduce;

  return (
    <nav aria-label="Main navigation" className={cn("inline-flex", className)}>
      <ul className="m-0 flex list-none items-center gap-0.5 p-0">
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.li
              key={item.href}
              initial={stagger ? { opacity: 0, y: -6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: stagger ? i * 0.045 : 0,
                duration: 0.32,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              className="relative"
            >
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium leading-none whitespace-nowrap",
                  "transition-[background-color,color,transform] duration-(--motion-fast) ease-(--ease-premium)",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive
                    ? "text-background"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground motion-safe:hover:-translate-y-0.5",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={ACTIVE_PILL_LAYOUT_ID}
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-foreground shadow-sm shadow-foreground/20"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                            mass: 0.7,
                          }
                    }
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
