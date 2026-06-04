"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn, FOCUS_RING } from "@/lib/utils";

interface SelectedWorkRailProps {
  /** Server-rendered frame slots (ready cards, divider, draft cards). */
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
  railLabel: string;
}

/**
 * Horizontal "production line" for the selected-work slide. The cards
 * themselves are async server components, so they arrive as `children`
 * and this client shell only owns the scroll mechanics:
 *
 *   - Native snap scroll (`snap-x`) so touch + trackpad feel right.
 *   - HUD prev/next buttons that page by one card (the home's vertical
 *     Lenis owns the wheel, so explicit controls matter on desktop).
 *   - Pointer drag-to-scroll for mouse users, with a movement threshold
 *     that suppresses the trailing click so a drag never opens a card.
 *   - A live scrollbar thumb + edge fades for position feedback.
 *
 * Reduced motion swaps smooth programmatic scroll for instant jumps.
 */
export function SelectedWorkRail({
  children,
  prevLabel,
  nextLabel,
  railLabel,
}: SelectedWorkRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewRatio, setViewRatio] = useState(1);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
    setProgress(max > 8 ? el.scrollLeft / max : 0);
    setViewRatio(
      el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1,
    );
  }, []);

  // Coalesce scroll-driven reads to one layout read per frame — a flung
  // drag fires `scroll` far faster than 60fps, and each `update` reads
  // scrollWidth/clientWidth/scrollLeft.
  const scheduleUpdate = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      update();
    });
  }, [update]);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [update]);

  const page = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const slide = el.querySelector<HTMLElement>("[data-rail-slide]");
      const amount = slide ? slide.offsetWidth + 16 : el.clientWidth * 0.8;
      el.scrollBy({ left: dir * amount, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  // Pointer drag-to-scroll (mouse only; touch already pans natively).
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    // Capture so the drag survives the pointer leaving the track (a fast
    // flick) and always gets its pointerup.
    el.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
  }
  function endDrag(e: React.PointerEvent) {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = trackRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }
  // Capture-phase: a click that completes a drag is swallowed before it
  // reaches the card link, so dragging never navigates.
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  const scrollable = viewRatio < 0.999;

  return (
    <div className="relative">
      {/* Edge fades — dissolve cards into the slide at both ends. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-background to-transparent transition-opacity duration-(--motion-fast) sm:w-14",
          atStart && "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent transition-opacity duration-(--motion-fast) sm:w-14",
          atEnd && "opacity-0",
        )}
      />

      <div
        ref={trackRef}
        role="region"
        aria-label={railLabel}
        tabIndex={0}
        onScroll={scheduleUpdate}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          // scroll-px keeps a keyboard-focused card clear of the edge
          // fades when it scrolls into view.
          "flex gap-4 overflow-x-auto overscroll-x-contain scroll-px-6 px-0.5 py-2 snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "motion-safe:scroll-smooth",
          scrollable && "cursor-grab active:cursor-grabbing",
          FOCUS_RING,
        )}
      >
        {children}
      </div>

      {/* Controls — scrollbar thumb + HUD pager. Hidden when everything
          already fits (nothing to scroll). */}
      {scrollable ? (
        <div className="mt-5 flex items-center gap-4">
          <div className="relative h-px flex-1 bg-border">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -my-px h-[3px] rounded-full bg-ring transition-[left] duration-(--motion-fast) ease-(--ease-premium)"
              style={{
                width: `${Math.max(12, viewRatio * 100)}%`,
                left: `${progress * (100 - Math.max(12, viewRatio * 100))}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <RailButton
              label={prevLabel}
              disabled={atStart}
              onClick={() => page(-1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </RailButton>
            <RailButton
              label={nextLabel}
              disabled={atEnd}
              onClick={() => page(1)}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </RailButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-border bg-card/70 text-foreground transition-[color,border-color,opacity] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-ring/50 hover:text-ring disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:text-foreground",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}
