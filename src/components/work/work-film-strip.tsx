"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { ProjectCard } from "@/components/cards/project-card";
import type { Project } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";

interface WorkFilmStripProps {
  projects: Project[];
  locale: Locale;
  prevLabel: string;
  nextLabel: string;
  railLabel: string;
}

/**
 * Work "strip" view — a draggable inertia depth film-strip. Lifts
 * SelectedWorkRail's scroll mechanics (native snap + momentum, mouse drag with a
 * 6px threshold + capture-phase click-swallow, RAF-coalesced reads, HUD pager,
 * edge fades) and adds center-proximity depth: the card nearest the viewport
 * centre rides at full scale, neighbours recede + dim — transforms only, read
 * once per frame.
 *
 * Accessibility: every card stays a real keyboard-reachable `ProjectCard` link
 * (Tab → Enter opens it), the track is a focusable region, drag is mouse-only,
 * touch taps still navigate. Under `prefers-reduced-motion` the depth is skipped
 * entirely — it renders as a plain horizontal snap row (and the grid view
 * remains the canonical default/fallback).
 */
export function WorkFilmStrip({
  projects,
  locale,
  prevLabel,
  nextLabel,
  railLabel,
}: WorkFilmStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewRatio, setViewRatio] = useState(1);

  // Per-card depth from distance to the track's viewport centre. Transforms
  // only; skipped under reduced motion (cards stay flat).
  const applyDepth = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>("[data-strip-slide]");
    if (reduced) {
      slides.forEach((slide) => {
        slide.style.transform = "";
        slide.style.opacity = "";
        slide.removeAttribute("data-strip-active");
      });
      return;
    }
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest: HTMLElement | null = null;
    let nearestT = Infinity;
    slides.forEach((slide) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const t = Math.min(1, Math.abs(slideCenter - center) / el.clientWidth);
      // Ease the falloff (t²) so the centre frame holds full size across a
      // wider plateau and neighbours recede sharply — a real depth-of-field
      // pull, not a gentle gradient.
      const e = t * t;
      const scale = (1 - e * 0.18).toFixed(3);
      const ty = (e * 18).toFixed(1);
      slide.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`;
      slide.style.opacity = (1 - e * 0.42).toFixed(3);
      if (t < nearestT) {
        nearestT = t;
        nearest = slide;
      }
    });
    // Anchor the focused frame so the depth reads as intent, not drift.
    slides.forEach((slide) => {
      slide.toggleAttribute("data-strip-active", slide === nearest);
    });
  }, [reduced]);

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
    applyDepth();
  }, [applyDepth]);

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
      const slide = el.querySelector<HTMLElement>("[data-strip-slide]");
      const amount = slide ? slide.offsetWidth + 20 : el.clientWidth * 0.8;
      el.scrollBy({ left: dir * amount, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  // Pointer drag-to-scroll (mouse only; touch pans natively).
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
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  const scrollable = viewRatio < 0.999;

  return (
    <div className="relative mt-10">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-background to-transparent transition-opacity duration-(--motion-fast) sm:w-16",
          atStart && "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent transition-opacity duration-(--motion-fast) sm:w-16",
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
          "flex gap-5 overflow-x-auto overscroll-x-contain scroll-px-6 px-0.5 py-6 snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "motion-safe:scroll-smooth",
          scrollable && "cursor-grab active:cursor-grabbing",
          FOCUS_RING,
        )}
      >
        {projects.map((project) => (
          <div
            data-strip-slide
            key={project.slug}
            className="w-[80vw] max-w-[22rem] shrink-0 snap-center rounded-xl transition-shadow duration-(--motion-medium) ease-(--ease-premium) will-change-transform data-strip-active:ring-2 data-strip-active:ring-ring-2/40 sm:w-[20rem]"
          >
            <ProjectCard project={project} locale={locale} />
          </div>
        ))}
      </div>

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
            <StripButton label={prevLabel} disabled={atStart} onClick={() => page(-1)}>
              <ChevronLeft
                aria-hidden="true"
                className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:-translate-x-0.5"
              />
            </StripButton>
            <StripButton label={nextLabel} disabled={atEnd} onClick={() => page(1)}>
              <ChevronRight
                aria-hidden="true"
                className="size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:translate-x-0.5"
              />
            </StripButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StripButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "group grid size-9 place-items-center rounded-full border border-border bg-card/70 text-foreground transition-[color,border-color,opacity] duration-(--motion-fast) ease-(--ease-premium) pointer-coarse:size-11",
        "hover:border-ring/50 hover:text-ring disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:text-foreground",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}
