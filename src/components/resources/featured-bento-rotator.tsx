"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Pause,
  Play,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";
import { ToolIcon } from "./tool-icon";

export interface BentoItem {
  /** Stable identifier — also used as the React key. */
  id: string;
  name: string;
  description: string;
  /** Absolute or locale-relative href. External `link` items pass `external: true`. */
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /** Optional lucide iconKey resolved by ToolIcon. */
  iconKey?: string;
  /** Optional tags used by ToolIcon's tag-fallback + as Badge fragments. */
  tags?: string[];
  /** Optional one-word category shown as a Badge in the corner of the hero tile. */
  category?: string;
}

interface FeaturedBentoRotatorProps {
  items: BentoItem[];
  locale: Locale;
  /** Copy bag — keep server-side at the parent so this stays portable. */
  labels: {
    /** "Spotlight", "Spotlight links" — eyebrow text above the heading. */
    eyebrow: string;
    /** "Pinned tools", "Daily-use links" — the section H2. */
    heading: string;
    /** Spoken by screen readers as the section name. */
    regionLabel: string;
    /** Button labels and aria. */
    prev: string;
    next: string;
    pause: string;
    play: string;
    collapse: string;
    expand: string;
    /** `{name}` is substituted. */
    openAria: string;
    /** "Tile 2 of 4" — used as aria-label per dot. */
    gotoPage: string;
    /** Short label for the corner badge ("Tool", "Link"). */
    typeBadge: string;
  };
  /** Auto-rotation interval in ms. Defaults to 8000. */
  intervalMs?: number;
  /** Stable storage key for the collapse preference. */
  collapseStorageKey?: string;
}

const DEFAULT_INTERVAL_MS = 8000;
const DEFAULT_COLLAPSE_KEY = "m4rkyu:resources:bento-collapsed";
const COLLAPSE_EVENT = "m4rkyu:resources-bento-collapsed-changed";
const HIGHLIGHT_MS = 1500;
const PAGE_SIZE = 5;

// Auto-rotating bento. Five tiles per page (one hero + four secondary).
// Pauses on hover, pauses while the document is hidden, honors
// `useReducedMotion` (no auto-advance, manual controls keep working).
// Used by both /resources/tools and /resources/links — pass tools or
// links via `items`.
export function FeaturedBentoRotator({
  items,
  locale,
  labels,
  intervalMs = DEFAULT_INTERVAL_MS,
  collapseStorageKey = DEFAULT_COLLAPSE_KEY,
}: FeaturedBentoRotatorProps) {
  const headingId = useId();
  const reduceMotion = useReducedMotion();
  const collapsed = useCollapsed(collapseStorageKey);
  const setCollapsed = useSetCollapsed(collapseStorageKey);

  // Group items into pages of PAGE_SIZE. Pages with fewer than
  // PAGE_SIZE items render with whatever they have — the layout
  // gracefully degrades when the final page is partial.
  const pages = useMemo(() => chunk(items, PAGE_SIZE), [items]);
  const isStatic = items.length <= PAGE_SIZE || pages.length <= 1;

  const [rawPageIndex, setPageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const docHidden = useDocumentHidden();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Derive a safe page index instead of clamping in state — keeps us
  // out of the React 19 "no setState in effect" rule.
  const pageIndex =
    pages.length === 0
      ? 0
      : rawPageIndex >= pages.length
        ? 0
        : rawPageIndex;

  // Auto-advance loop. Cleared on every dependency change so manual
  // navigation resets the clock to the full interval (don't punish
  // the user with a half-elapsed timer they didn't see start).
  useEffect(() => {
    if (isStatic) return;
    if (reduceMotion) return;
    if (collapsed) return;
    if (paused || hovered || docHidden) return;
    const id = window.setTimeout(() => {
      setPageIndex((current) => (current + 1) % pages.length);
    }, intervalMs);
    return () => window.clearTimeout(id);
  }, [
    pageIndex,
    pages.length,
    paused,
    hovered,
    docHidden,
    reduceMotion,
    collapsed,
    intervalMs,
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

  const goPrev = useCallback(() => goTo(pageIndex - 1), [goTo, pageIndex]);
  const goNext = useCallback(() => goTo(pageIndex + 1), [goTo, pageIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
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
  const [hero, ...rest] = currentPage;

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-labelledby={headingId}
      aria-label={labels.regionLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={isStatic ? -1 : 0}
      className={cn(
        "grid gap-3 rounded-lg",
        FOCUS_RING,
        "focus-visible:ring-offset-0",
      )}
    >
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
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "grid gap-3 transition-opacity duration-(--motion-fast) ease-(--ease-premium) lg:grid-cols-3 lg:auto-rows-[minmax(11rem,1fr)]",
              docHidden && "opacity-95",
            )}
          >
            {hero ? (
              <BentoHeroTile
                key={`hero-${pageIndex}-${hero.id}`}
                item={hero}
                locale={locale}
                openAriaTemplate={labels.openAria}
                typeBadge={labels.typeBadge}
                highlight={!isStatic && !reduceMotion}
              />
            ) : null}
            {rest.length > 0 ? (
              <div className="grid gap-3 lg:row-start-2 lg:row-span-2 lg:auto-rows-[minmax(10.5rem,1fr)]">
                {rest.map((item) => (
                  <BentoSecondaryTile
                    key={`secondary-${pageIndex}-${item.id}`}
                    item={item}
                    locale={locale}
                    openAriaTemplate={labels.openAria}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {!isStatic ? (
            <div
              role="tablist"
              aria-label={labels.regionLabel}
              className="flex flex-wrap items-center gap-1.5"
            >
              {pages.map((_, index) => {
                const active = index === pageIndex;
                return (
                  <button
                    key={index}
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

function BentoHeroTile({
  item,
  locale,
  openAriaTemplate,
  typeBadge,
  highlight,
}: {
  item: BentoItem;
  locale: Locale;
  openAriaTemplate: string;
  typeBadge: string;
  highlight: boolean;
}) {
  const ariaLabel = openAriaTemplate.replace("{name}", item.name);
  // Initialise the beam on (re-)mount; flip off after HIGHLIGHT_MS.
  // setState lives in the timer callback, not the effect body — keeps
  // the React 19 "no setState in effect" rule happy.
  const [showBeam, setShowBeam] = useState(highlight);

  useEffect(() => {
    if (!highlight) return;
    const id = window.setTimeout(() => setShowBeam(false), HIGHLIGHT_MS);
    return () => window.clearTimeout(id);
  }, [highlight]);

  const content = (
    <>
      <PointerSpotlight radius={520} intensity={0.22} />
      {showBeam ? <BorderBeam borderRadius={8} duration={3} /> : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cyber-grid opacity-25"
      />
      <div className="relative z-20 flex items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-md border border-ring/40 bg-background/60 text-ring">
          <ToolIcon
            iconKey={item.iconKey}
            tags={item.tags}
            className="size-6"
          />
        </span>
        <Badge
          variant="success"
          className="gap-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
        >
          {typeBadge}
        </Badge>
      </div>
      <div className="relative z-20 grid gap-2">
        <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {item.name}
        </h3>
        <p className="max-w-prose text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {item.description}
        </p>
        {item.tags && item.tags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="font-mono text-[0.55rem]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative z-20 flex items-center gap-2 text-sm text-foreground">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          open
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
        />
      </div>
    </>
  );

  const className = cn(
    "group relative isolate flex h-full min-h-[16rem] flex-col justify-between gap-4 overflow-hidden rounded-lg border border-border bg-card/80 p-6 transition-[border-color] duration-(--motion-fast) ease-(--ease-premium) lg:col-span-2 lg:row-span-2",
    "hover:border-ring/70",
    FOCUS_RING,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      locale={locale}
      aria-label={ariaLabel}
      className={className}
    >
      {content}
    </Link>
  );
}

function BentoSecondaryTile({
  item,
  locale,
  openAriaTemplate,
}: {
  item: BentoItem;
  locale: Locale;
  openAriaTemplate: string;
}) {
  const ariaLabel = openAriaTemplate.replace("{name}", item.name);

  const content = (
    <>
      <PointerSpotlight radius={300} intensity={0.18} />
      <div className="relative z-20 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border/70 bg-background/60 text-ring">
          <ToolIcon
            iconKey={item.iconKey}
            tags={item.tags}
            className="size-4.5"
          />
        </span>
        <div className="min-w-0 grid gap-0.5">
          <h3 className="truncate text-sm font-semibold leading-tight">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
      <ArrowUpRight
        aria-hidden="true"
        className="relative z-20 size-4 self-end text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
      />
    </>
  );

  const className = cn(
    "group relative isolate flex h-full flex-col justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-[border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
    "hover:border-ring/60 motion-safe:hover:-translate-y-0.5",
    FOCUS_RING,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      locale={locale}
      aria-label={ariaLabel}
      className={className}
    >
      {content}
    </Link>
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
  children: React.ReactNode;
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
        "grid size-8 place-items-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium)",
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

// --- document visibility ------------------------------------------------------

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

// useSyncExternalStore lets us read `document.hidden` without
// triggering the React 19 "no setState in effect" rule.
function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    subscribeDocumentVisibility,
    getDocumentHiddenSnapshot,
    getDocumentHiddenServerSnapshot,
  );
}

// --- collapse persistence -----------------------------------------------------

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
