"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Pause,
  Play,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// React Bits TargetCursor — scoped tight to bento tiles only so the
// reticle reads as an accent on the cards, never a page-wide cursor
// takeover. Lazy-loaded so the GSAP timeline cost only lands when the
// rotator is mounted, and gated below to only render while the pointer
// is actually inside the bento section.
const TargetCursor = dynamic(
  () =>
    import("@/components/ui/magic/target-cursor").then((mod) => ({
      default: mod.TargetCursor,
    })),
  { ssr: false },
);

export interface BentoRotatorLabels {
  /** Eyebrow above the heading. */
  eyebrow: string;
  /** Section h2. */
  heading: string;
  /** Spoken region name. */
  regionLabel: string;
  prev: string;
  next: string;
  pause: string;
  play: string;
  collapse: string;
  expand: string;
  /** Template `"Go to page {index}"`. */
  gotoPage: string;
}

export interface BentoRotatorShellProps<T> {
  /** Source list — the shell chunks this into pages of `pageSize`. */
  items: T[];
  /** Items per page (1 hero + `pageSize - 1` secondary). */
  pageSize: number;
  /** Stable key for each item — used as the React key. */
  getItemKey: (item: T) => string;
  /** Render one page's worth of items. */
  renderPage: (pageItems: T[], pageIndex: number) => ReactNode;
  /** Optional decorative backdrop for the inner grid frame. */
  renderBackdrop?: () => ReactNode;
  labels: BentoRotatorLabels;
  /** Desktop auto-advance interval. Defaults to 8000ms. */
  intervalMs?: number;
  /** Mobile (`(max-width: 767px)`) auto-advance interval. Defaults to 10000ms. */
  mobileIntervalMs?: number;
  /** localStorage key for the collapse preference. */
  collapseStorageKey: string;
  /** Optional className for the section root. */
  className?: string;
}

const DEFAULT_INTERVAL_MS = 8000;
const DEFAULT_MOBILE_INTERVAL_MS = 10000;
const COLLAPSE_EVENT = "m4rkyu:bento-rotator-collapsed-changed";
const PULSE_MS = 600;

export function BentoRotatorShell<T>({
  items,
  pageSize,
  getItemKey,
  renderPage,
  renderBackdrop,
  labels,
  intervalMs = DEFAULT_INTERVAL_MS,
  mobileIntervalMs = DEFAULT_MOBILE_INTERVAL_MS,
  collapseStorageKey,
  className,
}: BentoRotatorShellProps<T>) {
  const headingId = useId();
  const reduceMotion = useReducedMotion();
  const collapsed = useCollapsed(collapseStorageKey);
  const setCollapsed = useSetCollapsed(collapseStorageKey);
  // The 8s desktop pacing reads as urgent on phone-sized viewports;
  // 10s gives a moment to read a tile before the next swap. Reading
  // the media query at render time keeps the timer in sync with
  // viewport rotation.
  const isMobile = useMediaQuery("(max-width: 767px)");
  const effectiveInterval = isMobile ? mobileIntervalMs : intervalMs;

  const pages = useMemo(() => chunk(items, pageSize), [items, pageSize]);
  const isStatic = items.length <= pageSize || pages.length <= 1;

  const [rawPageIndex, setPageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Gate the TargetCursor mount on pointer-inside-section. The reticle
  // is meant to feel like an accent that animates onto the bento, not
  // a persistent overlay — keeping it unmounted everywhere else means
  // the native cursor stays visible on buttons, dots, page chrome,
  // and the rest of the site.
  const [pointerInside, setPointerInside] = useState(false);
  const finePointer = useMediaQuery("(pointer: fine)");
  const docHidden = useDocumentHidden();
  const sectionRef = useRef<HTMLElement | null>(null);

  const pageIndex =
    pages.length === 0
      ? 0
      : rawPageIndex >= pages.length
        ? 0
        : rawPageIndex;

  // Auto-advance loop. Cleared on every dependency change so manual
  // navigation resets the clock — don't punish the user with a
  // partly-elapsed timer they didn't see start.
  useEffect(() => {
    if (isStatic) return;
    if (reduceMotion) return;
    if (collapsed) return;
    if (paused || hovered || docHidden) return;
    const id = window.setTimeout(() => {
      setPageIndex((current) => (current + 1) % pages.length);
    }, effectiveInterval);
    return () => window.clearTimeout(id);
  }, [
    pageIndex,
    pages.length,
    paused,
    hovered,
    docHidden,
    reduceMotion,
    collapsed,
    effectiveInterval,
    isStatic,
  ]);

  const goTo = useCallback(
    (next: number) => {
      if (pages.length === 0) return;
      const normalized = ((next % pages.length) + pages.length) % pages.length;
      setPageIndex(normalized);
    },
    [pages.length],
  );

  const goPrev = useCallback(
    () => goTo(pageIndex - 1),
    [goTo, pageIndex],
  );
  const goNext = useCallback(
    () => goTo(pageIndex + 1),
    [goTo, pageIndex],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && !collapsed) {
      event.preventDefault();
      setCollapsed(true);
      return;
    }
    if (isStatic) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  }

  if (items.length === 0) return null;

  const currentPage = pages[pageIndex] ?? pages[0] ?? [];

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-labelledby={headingId}
      aria-label={labels.regionLabel}
      onMouseEnter={() => {
        setHovered(true);
        setPointerInside(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setPointerInside(false);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={isStatic ? -1 : 0}
      className={cn(
        "grid gap-3 rounded-lg",
        FOCUS_RING,
        "focus-visible:ring-offset-0",
        className,
      )}
    >
      {/* TargetCursor lives at the section level but only renders
          while the pointer is inside the bento. `hideDefaultCursor`
          stays false so the native cursor remains visible on the
          prev/next/play-pause/collapse buttons and the dot pager
          — the reticle is an accent that only snaps onto tiles
          tagged `data-bento-tile`. */}
      {finePointer && !reduceMotion && pointerInside && !collapsed ? (
        <TargetCursor
          targetSelector="[data-bento-tile]"
          hideDefaultCursor={false}
        />
      ) : null}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {labels.eyebrow}
          </p>
          <h2 id={headingId} className="text-lg font-semibold">
            {labels.heading}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {!isStatic ? (
            <>
              <IconButton
                onClick={goPrev}
                ariaLabel={labels.prev}
                disabled={collapsed}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton
                onClick={() => setPaused((p) => !p)}
                ariaLabel={paused ? labels.play : labels.pause}
                pressed={paused}
                disabled={collapsed || reduceMotion ? true : false}
              >
                {paused ? (
                  <Play aria-hidden="true" className="size-3.5" />
                ) : (
                  <Pause aria-hidden="true" className="size-3.5" />
                )}
              </IconButton>
              <IconButton
                onClick={goNext}
                ariaLabel={labels.next}
                disabled={collapsed}
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </IconButton>
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
            </>
          ) : null}
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            ariaLabel={collapsed ? labels.expand : labels.collapse}
            pressed={collapsed}
          >
            {collapsed ? (
              <ChevronsUpDown aria-hidden="true" className="size-3.5" />
            ) : (
              <ChevronsDownUp aria-hidden="true" className="size-3.5" />
            )}
          </IconButton>
        </div>
      </header>

      {!collapsed ? (
        <div className="grid gap-3">
          <div
            // Keying on `pageIndex` re-mounts this wrapper on every
            // rotation, which re-fires the `bento-pulse` keyframe
            // (CSS animations only play once per element instance).
            // No setState-in-effect required.
            key={`pulse-${pageIndex}`}
            className={cn(
              "relative isolate rounded-lg",
              !reduceMotion && !isStatic ? "bento-pulse" : null,
            )}
            style={
              !reduceMotion && !isStatic
                ? ({ "--bento-pulse-ms": `${PULSE_MS}ms` } as CSSProperties)
                : undefined
            }
          >
            {renderBackdrop ? renderBackdrop() : null}
            <div
              aria-live="polite"
              aria-atomic="true"
              className={cn(
                "relative z-10 transition-opacity duration-(--motion-fast) ease-(--ease-premium)",
                docHidden && "opacity-95",
              )}
            >
              {renderPage(currentPage, pageIndex)}
            </div>
          </div>

          {!isStatic ? (
            <div
              role="tablist"
              aria-label={labels.regionLabel}
              className="flex flex-wrap items-center gap-2 md:gap-1.5"
            >
              {pages.map((_, index) => {
                const active = index === pageIndex;
                const firstKey = pages[index][0]
                  ? getItemKey(pages[index][0])
                  : `page-${index}`;
                return (
                  <button
                    key={`${index}-${firstKey}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={labels.gotoPage.replace(
                      "{index}",
                      String(index + 1),
                    )}
                    onClick={() => goTo(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-[background-color,width] duration-(--motion-fast) ease-(--ease-premium)",
                      FOCUS_RING_INSET,
                      active
                        ? "w-6 bg-foreground"
                        : "w-1.5 bg-border hover:bg-muted-foreground",
                    )}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function IconButton({
  onClick,
  ariaLabel,
  children,
  pressed,
  disabled,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      disabled={disabled}
      className={cn(
        // ≥44px tap target on touch viewports per WCAG; tightens to
        // 32px on desktop where pointer accuracy is higher.
        "grid size-11 place-items-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) md:size-8",
        "hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-px",
        "disabled:pointer-events-none disabled:opacity-40",
        pressed && "border-ring/60 text-foreground",
        FOCUS_RING_INSET,
      )}
    >
      {children}
    </button>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// --- document visibility ----------------------------------------------------

function subscribeDocumentVisibility(callback: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function getDocumentHiddenSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.hidden;
}
function getDocumentHiddenServerSnapshot(): boolean {
  return false;
}
function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    subscribeDocumentVisibility,
    getDocumentHiddenSnapshot,
    getDocumentHiddenServerSnapshot,
  );
}

// --- collapse persistence ---------------------------------------------------

function useCollapsed(storageKey: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) =>
      subscribeStoredValue(storageKey, COLLAPSE_EVENT, callback),
    [storageKey],
  );
  const getSnapshot = useCallback(
    () => readStoredString(storageKey) === "1",
    [storageKey],
  );
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function useSetCollapsed(storageKey: string) {
  return useCallback(
    (next: boolean) => {
      writeStoredString(storageKey, next ? "1" : "0");
      dispatchStoredValueChanged(COLLAPSE_EVENT);
    },
    [storageKey],
  );
}
