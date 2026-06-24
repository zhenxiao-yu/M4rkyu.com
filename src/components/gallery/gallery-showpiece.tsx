"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BlurImage } from "@/components/ui/blur-image";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { aspectClass, orderFrames } from "@/components/gallery/frame-tile";
import type { GalleryItem } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";

const MAX_TILES = 16;

/**
 * Gallery showpiece — a guarded CSS-3D "frame orbit": the collection's frames
 * ride a `preserve-3d` ring you drag to spin, the front frame riding largest.
 * It is the ONE heavy interaction of the curated-bold pass, and it is purely
 * presentational — clicking a frame writes `?frame=<slug>` so the page's
 * EXISTING GalleryLightbox opens (no forked viewer). Real `<button>` tiles with
 * alt text keep it keyboard-operable; the full browsable masonry sits below.
 *
 * Mounted only by GalleryShowpieceMount, which gates it to desktop + motion-OK
 * clients (reduced-motion / touch never load this chunk — the masonry is the
 * experience there). Transforms only; one rAF; parked off-screen + backgrounded.
 */
export function GalleryShowpiece({ items }: { items: GalleryItem[] }) {
  const t = useTranslations("Gallery");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tiles = useMemo(() => orderFrames(items).slice(0, MAX_TILES), [items]);
  const step = tiles.length > 0 ? 360 / tiles.length : 0;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);
  const captionRef = useRef<HTMLSpanElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  const openFrame = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("frame", slug);
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring || tiles.length === 0) return;

    let raf = 0;
    let angle = 0;
    let velocity = 0;
    let dragging = false;
    let running = false;
    let inView = false;
    let radius = 0;
    let frontIndex = -1;

    const computeRadius = () => {
      const tileW = tileRefs.current[0]?.offsetWidth ?? 240;
      const s = Math.sin((step * Math.PI) / 360) || 0.5; // sin(step/2)
      return Math.max(tileW * 0.85, (tileW + 32) / (2 * s));
    };

    const render = () => {
      ring.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const tileAngle = i * step;
        const fr =
          (Math.cos(((angle + tileAngle) * Math.PI) / 180) + 1) / 2; // 0 back..1 front
        const scale = (0.9 + fr * 0.16).toFixed(3);
        tile.style.transform = `translate(-50%, -50%) rotateY(${tileAngle}deg) translateZ(${radius.toFixed(0)}px) scale(${scale})`;
        tile.style.opacity = (0.4 + fr * 0.6).toFixed(3);
        tile.style.zIndex = String(Math.round(fr * 100));
      });
      // Front-frame wayfinding — name the frame you'd open and its position.
      // DOM-only writes gated on change, so no React churn and no per-frame
      // layout: the front tile is the one whose net rotation nears 0°.
      const n = tiles.length;
      const fi = ((Math.round(-angle / step) % n) + n) % n;
      if (fi !== frontIndex) {
        frontIndex = fi;
        if (captionRef.current) captionRef.current.textContent = tiles[fi]?.title ?? "";
        if (counterRef.current) {
          counterRef.current.textContent = `${String(fi + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
        }
      }
    };

    const frame = () => {
      if (!dragging) {
        angle += velocity;
        velocity *= 0.94;
        if (Math.abs(velocity) < 0.02) {
          velocity = 0;
          angle += 0.04; // calm idle drift so the orbit reads alive
        }
      }
      render();
      raf = window.requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (inView && !document.hidden) start();
      else stop();
    };

    let lastX = 0;
    let moved = false;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      moved = false;
      lastX = e.clientX;
      velocity = 0;
      stage.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (Math.abs(dx) > 4) moved = true;
      const delta = dx * 0.35;
      angle += delta;
      velocity = delta;
      render();
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    };
    // Capture-phase: a click that completed a drag never opens a frame.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("click", onClickCapture, true);

    const ro = new ResizeObserver(() => {
      radius = computeRadius();
      render();
    });
    ro.observe(stage);
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);

    radius = computeRadius();
    render();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", endDrag);
      stage.removeEventListener("pointercancel", endDrag);
      stage.removeEventListener("click", onClickCapture, true);
    };
  }, [tiles, step]);

  if (tiles.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("showpieceHint")}
      className="relative isolate mb-10 overflow-hidden perspective-[1500px]"
    >
      {/* Soft theme-scoped spotlight grounds the orbit instead of letting it
       * float on flat background — one faint accent ink, no rainbow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 42%, color-mix(in oklab, var(--ring) 7%, transparent), transparent 72%)",
        }}
      />
      <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        {t("showpieceHint")}
      </p>
      <div
        ref={stageRef}
        className="relative mx-auto h-[clamp(18rem,46vh,30rem)] w-full touch-none select-none cursor-grab active:cursor-grabbing mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2 transform-3d will-change-transform"
        >
          {tiles.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              onClick={() => openFrame(item.slug)}
              aria-label={t("openFrame", { title: item.title })}
              className={cn(
                "absolute left-0 top-0 w-[clamp(10rem,20vw,16rem)] overflow-hidden rounded-md border border-border bg-card opacity-0 backface-hidden transform-3d will-change-transform",
                FOCUS_RING,
              )}
              style={{
                aspectRatio:
                  item.src?.width && item.src?.height
                    ? `${item.src.width} / ${item.src.height}`
                    : "4 / 5",
              }}
            >
              {item.src ? (
                <BlurImage
                  src={item.src.src}
                  alt={item.src.alt}
                  fill
                  fadeOnly
                  sizes="(min-width: 1024px) 20vw, 60vw"
                  placeholder={item.src.blurDataURL ? "blur" : undefined}
                  blurDataURL={item.src.blurDataURL}
                  className="object-cover"
                />
              ) : (
                <PlaceholderImage
                  label={t("frameTbd")}
                  aspect={aspectClass(item.aspect)}
                  className="rounded-none border-0"
                />
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Live front-frame readout — a monospace position counter and the title
       * of the frame currently facing front, both written from the rAF loop.
       * aria-hidden: the focusable tiles already carry per-frame labels, and a
       * caption that ticks on every spin would only spam assistive tech. */}
      <div
        aria-hidden="true"
        className="mt-5 flex items-center justify-center gap-3"
      >
        <span
          ref={counterRef}
          className="shrink-0 font-mono text-[0.6rem] uppercase tabular-nums tracking-[0.25em] text-muted-foreground"
        />
        <span className="h-3 w-px shrink-0 bg-border" />
        <span
          ref={captionRef}
          className="max-w-[28ch] truncate font-display text-sm font-medium tracking-tight text-foreground"
        />
      </div>
    </section>
  );
}
