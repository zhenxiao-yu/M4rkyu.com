"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { parseFloatSafe } from "@/components/tools/_shared/number";
import {
  type BezierPoints,
  clampBezierPoint,
  formatCubicBezier,
  roundCoord,
} from "@/lib/tools/bezier";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// Cubic-bezier easing editor. The curve, CSS output, copy value, and live
// preview all derive from the pure, unit-tested helpers in @/lib/tools/bezier,
// so they can never drift. Control points are editable by dragging the SVG
// handles (pointer) or typing the number inputs (keyboard). P1/P2 x are clamped
// to [0, 1] (CSS cubic-bezier requires it); y is left free for overshoot
// easings. A drag keeps y within a visible -0.5..1.5 band purely for ergonomics
// — typing can still push y further.

// SVG geometry: a 0..1 box scaled to 200, padded so handles in the overshoot
// band stay inside the canvas instead of clipping.
const SIZE = 200;
const PAD = 60;
const VB = SIZE + PAD * 2;
const DRAG_Y_MIN = -0.5;
const DRAG_Y_MAX = 1.5;

const PRESETS = ["linear", "ease", "easeIn", "easeOut", "easeInOut", "premium"] as const;
type PresetKey = (typeof PRESETS)[number];

const PRESET_VALUES: Record<PresetKey, BezierPoints> = {
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  easeIn: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  easeOut: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  easeInOut: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  premium: { x1: 0.2, y1: 0.7, x2: 0.2, y2: 1 },
};

function vx(x: number) {
  return PAD + x * SIZE;
}
function vy(y: number) {
  return PAD + (1 - y) * SIZE;
}

type Handle = "p1" | "p2";

export function CubicBezier() {
  const t = useTranslations("Tools.bezier");
  const tc = useTranslations("Tools.common");
  const reduceMotion = useReducedMotion();

  const [points, setPoints] = useState<BezierPoints>(PRESET_VALUES.easeInOut);
  const [duration, setDuration] = useState(800);
  const [playKey, setPlayKey] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<Handle | null>(null);

  const css = formatCubicBezier(points);

  function setHandle(handle: Handle, x: number, y: number) {
    const clamped = clampBezierPoint(x, y);
    setPoints((prev) =>
      handle === "p1"
        ? { ...prev, x1: roundCoord(clamped.x), y1: roundCoord(clamped.y) }
        : { ...prev, x2: roundCoord(clamped.x), y2: roundCoord(clamped.y) },
    );
  }

  function pointerToCoords(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    // viewBox is square (VB), so px-per-unit is the same on both axes.
    const unit = rect.width / VB;
    const localX = (event.clientX - rect.left) / unit - PAD;
    const localY = (event.clientY - rect.top) / unit - PAD;
    const x = localX / SIZE;
    const y = 1 - localY / SIZE;
    return {
      x, // clampBezierPoint will clamp x into [0,1]
      y: Math.min(DRAG_Y_MAX, Math.max(DRAG_Y_MIN, y)),
    };
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!dragging.current) return;
    const coords = pointerToCoords(event);
    if (!coords) return;
    setHandle(dragging.current, coords.x, coords.y);
  }

  function startDrag(handle: Handle, event: React.PointerEvent<SVGCircleElement>) {
    dragging.current = handle;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function endDrag() {
    dragging.current = null;
  }

  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-4">
        <div className="aspect-square w-full max-w-md rounded-md border border-border/60 bg-background/40 p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB} ${VB}`}
            preserveAspectRatio="xMidYMid meet"
            className="block h-full w-full touch-none select-none overflow-visible"
            role="img"
            aria-label={t("curveLabel", { value: css })}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* unit box */}
            <rect
              x={vx(0)}
              y={vy(1)}
              width={SIZE}
              height={SIZE}
              fill="none"
              className="stroke-border"
              strokeWidth={1}
            />
            {/* quarter grid */}
            {[0.25, 0.5, 0.75].map((g) => (
              <g key={g} className="stroke-muted-foreground" strokeOpacity={0.15}>
                <line x1={vx(g)} y1={vy(0)} x2={vx(g)} y2={vy(1)} />
                <line x1={vx(0)} y1={vy(g)} x2={vx(1)} y2={vy(g)} />
              </g>
            ))}
            {/* handle lines */}
            <line
              x1={vx(0)}
              y1={vy(0)}
              x2={vx(points.x1)}
              y2={vy(points.y1)}
              className="stroke-muted-foreground"
              strokeOpacity={0.5}
              strokeDasharray="4 4"
            />
            <line
              x1={vx(1)}
              y1={vy(1)}
              x2={vx(points.x2)}
              y2={vy(points.y2)}
              className="stroke-muted-foreground"
              strokeOpacity={0.5}
              strokeDasharray="4 4"
            />
            {/* the curve */}
            <path
              d={`M ${vx(0)} ${vy(0)} C ${vx(points.x1)} ${vy(points.y1)}, ${vx(
                points.x2,
              )} ${vy(points.y2)}, ${vx(1)} ${vy(1)}`}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              className="stroke-ring"
            />
            {/* endpoints */}
            <circle cx={vx(0)} cy={vy(0)} r={4} className="fill-muted-foreground" />
            <circle cx={vx(1)} cy={vy(1)} r={4} className="fill-muted-foreground" />
            {/* draggable handles — tap target ~36px via the invisible hit ring */}
            {(["p1", "p2"] as const).map((handle) => {
              const cx = vx(handle === "p1" ? points.x1 : points.x2);
              const cy = vy(handle === "p1" ? points.y1 : points.y2);
              return (
                <g key={handle}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={18}
                    fill="transparent"
                    className="cursor-grab"
                    onPointerDown={(event) => startDrag(handle, event)}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    className="pointer-events-none fill-ring/25 stroke-ring"
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-xs">
              {css}
            </code>
            <CopyButton value={css} label="CSS" className="shrink-0" />
          </div>
        </div>

        <Preview css={css} duration={duration} playKey={playKey} reduce={reduceMotion} />
      </div>

      <div className="grid min-w-0 content-start gap-5">
        <fieldset className="grid min-w-0 gap-3">
          <legend className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("controlPoints")}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <CoordField
              label={t("p1x")}
              value={points.x1}
              onCommit={(n) => setHandle("p1", n, points.y1)}
            />
            <CoordField
              label={t("p1y")}
              value={points.y1}
              onCommit={(n) => setHandle("p1", points.x1, n)}
            />
            <CoordField
              label={t("p2x")}
              value={points.x2}
              onCommit={(n) => setHandle("p2", n, points.y2)}
            />
            <CoordField
              label={t("p2y")}
              value={points.y2}
              onCommit={(n) => setHandle("p2", points.x2, n)}
            />
          </div>
        </fieldset>

        <div className="grid min-w-0 gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("presets")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((key) => {
              const active =
                JSON.stringify(points) === JSON.stringify(PRESET_VALUES[key]);
              return (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "outline"}
                  onClick={() => setPoints(PRESET_VALUES[key])}
                  aria-pressed={active}
                  className="min-w-0 font-mono text-xs"
                >
                  {t(`presetNames.${key}`)}
                </Button>
              );
            })}
          </div>
        </div>

        <DurationField
          label={t("duration")}
          value={duration}
          onCommit={setDuration}
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setPlayKey((k) => k + 1)}
          disabled={reduceMotion ?? false}
          className="justify-self-start font-mono text-xs"
        >
          {t("replay")}
        </Button>
      </div>
    </div>
  );
}

function Preview({
  css,
  duration,
  playKey,
  reduce,
}: {
  css: string;
  duration: number;
  playKey: number;
  reduce: boolean | null;
}) {
  const t = useTranslations("Tools.bezier");

  return (
    <div className="grid gap-1.5">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {t("preview")}
      </span>
      <div
        className="relative h-10 w-full overflow-hidden rounded-md border border-border/60 bg-background/40"
        role="img"
        aria-label={t("previewLabel")}
      >
        {/* Keyed so any easing/duration/replay change remounts the dot at the
            start; the rAF flip below then triggers the CSS transition. Under
            reduced motion the dot simply rests at the end with no transition. */}
        <PreviewDot
          key={reduce ? "static" : `${css}-${duration}-${playKey}`}
          css={css}
          duration={duration}
          reduce={reduce}
        />
      </div>
    </div>
  );
}

function PreviewDot({
  css,
  duration,
  reduce,
}: {
  css: string;
  duration: number;
  reduce: boolean | null;
}) {
  // Mounts at "start" each time the parent re-keys; one rAF schedules the flip
  // to "end" so the browser registers a transition. setState lives inside the
  // rAF callback (not synchronous in the effect body).
  const [atEnd, setAtEnd] = useState(Boolean(reduce));

  useEffect(() => {
    if (reduce) return;
    const id = requestAnimationFrame(() => setAtEnd(true));
    return () => cancelAnimationFrame(id);
  }, [reduce]);

  return (
    <span
      className="absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-ring"
      style={{
        left: atEnd ? "calc(100% - 1.25rem)" : "0rem",
        transitionProperty: reduce ? "none" : "left",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: css,
      }}
    />
  );
}

function CoordField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const id = useId();
  // Local draft so a half-typed value ("-", "0.", "") doesn't snap mid-edit.
  // The committed value is normalized by setHandle → clampBezierPoint (x ∈
  // [0,1], y free), so an out-of-range entry self-corrects on blur.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(raw: string) {
    onCommit(parseFloatSafe(raw, value));
    setDraft(null);
  }

  return (
    <div className="grid min-w-0 gap-1">
      <label
        htmlFor={id}
        className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        aria-label={label}
        className={cn(
          "min-h-9 w-full min-w-0 rounded-md border border-border/60 bg-background/40 px-2 py-1 text-right font-mono text-sm tabular-nums",
          FOCUS_RING_INSET,
        )}
      />
    </div>
  );
}

function DurationField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  function commit(raw: string) {
    const n = parseFloatSafe(raw, value);
    onCommit(Math.min(5000, Math.max(100, Math.round(n))));
    setDraft(null);
  }

  return (
    <div className="grid min-w-0 gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={100}
          max={5000}
          step={50}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          aria-label={label}
          className={cn(
            "min-h-9 w-24 min-w-0 rounded-md border border-border/60 bg-background/40 px-2 py-1 text-right font-mono text-sm tabular-nums",
            FOCUS_RING,
          )}
        />
        <span className="font-mono text-xs text-muted-foreground">ms</span>
      </div>
    </div>
  );
}
