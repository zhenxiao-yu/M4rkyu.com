"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import styles from "./gooey-nav.module.css";

export interface GooeyNavItem {
  label: string;
  /** Locale-relative href used by next-intl Link (e.g. "/work"). */
  href: string;
  /** Optional override for "active" detection (regex on pathname). */
  matchPattern?: RegExp;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  /** ms — pill morph + particle lifetime base. */
  animationTime?: number;
  /** Particles spawned on active change. Default 12 (user-tuned). */
  particleCount?: number;
  particleDistances?: [number, number];
  /** Particle distribution radius in px. Default 500 (user-tuned). */
  particleR?: number;
  /** ms jitter on particle timing. Default 500 (user-tuned). */
  timeVariance?: number;
  /** CSS color tokens for the 4 particle colors. Default uses theme tokens. */
  colors?: [string, string, string, string];
  className?: string;
}

/**
 * GooeyNav — ReactBits port. Click a nav item, the active pill morphs
 * between items via SVG goo filter, and a burst of colored particles
 * springs outward. Active state is driven by the current pathname so
 * the pill snaps to the right item on first paint + after navigation.
 *
 * Adapted for M4rkyu:
 *   - Uses next-intl `<Link>` for locale-aware client-side navigation
 *   - Active index tracked via `usePathname()` instead of internal
 *     click state, so route changes from elsewhere (e.g. cmd-k) also
 *     update the pill
 *   - Theme-aware colors via CSS vars on the container
 *   - User-tuned defaults: particleCount=12, timeVariance=500, particleR=500
 */
export function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 12,
  particleDistances = [90, 10],
  particleR = 500,
  timeVariance = 500,
  colors,
  className,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const filterRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Compute active index from current pathname (matches the item
  // whose href is a prefix of the current path, longest-prefix wins).
  const activeIndex = useMemo(() => {
    let best = 0;
    let bestLen = -1;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
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

  const noise = (n = 1) => n / 2 - Math.random() * n;

  function getXY(
    distance: number,
    pointIndex: number,
    totalPoints: number,
  ): [number, number] {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  function createParticle(i: number, t: number, d: [number, number], r: number) {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: ((colors?.length ?? 4) - 1) >= 0
        ? ((i + Math.floor(Math.random() * 4)) % 4) + 1
        : 1,
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  }

  function makeParticles(element: HTMLElement) {
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, particleDistances, particleR);
      element.classList.remove(styles.active);
      window.setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.classList.add(styles.particle);
        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", `var(--color-${p.color}, currentColor)`);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);
        point.classList.add(styles.point);
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => element.classList.add(styles.active));
        window.setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            /* already removed */
          }
        }, t);
      }, 30);
    }
  }

  function updateEffectPosition(element: HTMLElement) {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styleObj = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styleObj);
    Object.assign(textRef.current.style, styleObj);
    textRef.current.innerText = (element.querySelector("a")?.innerText ?? element.innerText).trim();
  }

  // Track previous active so we only animate on actual change.
  const [animKey, setAnimKey] = useState(0);
  const prevActiveRef = useRef(activeIndex);
  useEffect(() => {
    if (prevActiveRef.current !== activeIndex) {
      setAnimKey((k) => k + 1);
      prevActiveRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Position pill + spawn particles whenever activeIndex changes
  // (route navigation triggers this).
  useEffect(() => {
    if (!navRef.current) return;
    const li = navRef.current.querySelectorAll("li")[activeIndex] as HTMLElement | undefined;
    if (!li) return;
    updateEffectPosition(li);
    textRef.current?.classList.add(styles.active);
    if (filterRef.current && animKey > 0) {
      // Clear any in-flight particles
      filterRef.current.querySelectorAll(`.${styles.particle}`).forEach((p) => p.remove());
      makeParticles(filterRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, animKey]);

  // Reposition on container resize.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const li = navRef.current?.querySelectorAll("li")[activeIndex] as HTMLElement | undefined;
      if (li) updateEffectPosition(li);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [activeIndex]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, item: GooeyNavItem) {
    // Let Next intercept the navigation. We don't preventDefault;
    // active state recomputes after pathname updates.
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    // Soft router push so the SPA transitions cleanly; the Link
    // would also do this, but we ensure pathname propagation.
    e.preventDefault();
    router.push(item.href);
  }

  // Theme-default particle colors when not supplied.
  const containerStyle: CSSProperties = {
    ["--gn-pill" as string]: "var(--foreground)",
    ["--gn-text" as string]: "var(--muted-foreground)",
    ["--gn-pill-text" as string]: "var(--background)",
    ["--gn-ring" as string]: "var(--ring)",
    ["--color-1" as string]: colors?.[0] ?? "var(--ring)",
    ["--color-2" as string]: colors?.[1] ?? "color-mix(in srgb, var(--ring) 60%, var(--foreground))",
    ["--color-3" as string]: colors?.[2] ?? "var(--foreground)",
    ["--color-4" as string]: colors?.[3] ?? "color-mix(in srgb, var(--foreground) 50%, transparent)",
  };

  return (
    <div
      ref={containerRef}
      className={cn(styles.container, className)}
      style={containerStyle}
    >
      <nav aria-label="Main navigation">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={item.href}
              className={cn(activeIndex === index && styles.active)}
            >
              <Link
                href={item.href}
                onClick={(e) => handleClick(e as React.MouseEvent<HTMLAnchorElement>, item)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className={cn(styles.effect, styles.filter)} ref={filterRef} aria-hidden="true" />
      <span className={cn(styles.effect, styles.text)} ref={textRef} aria-hidden="true" />
    </div>
  );
}
