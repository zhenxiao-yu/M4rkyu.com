import { cn } from "@/lib/utils";

export type ScribbleVariant =
  | "underline"
  | "circle"
  | "strike"
  | "arrow"
  | "box"
  | "scratch";

// Hand-authored "marker" geometry per variant. Paths are deliberately
// irregular (overshoots, wobble) so they read as drawn-by-hand rather
// than vector-perfect. `stretch` variants use preserveAspectRatio="none"
// so an underline/strike spans whatever width it's sized to; the closed
// shapes keep their aspect.
const SHAPES: Record<
  ScribbleVariant,
  { viewBox: string; d: string[]; stretch: boolean }
> = {
  underline: {
    viewBox: "0 0 120 14",
    d: [
      "M2 8 C 22 4 40 12 60 8 C 80 4 100 12 118 7",
      "M4 11 C 26 8 46 13 66 10 C 88 7 106 12 117 10",
    ],
    stretch: true,
  },
  strike: {
    viewBox: "0 0 120 12",
    d: ["M2 7 C 30 5 62 9 92 6 C 105 5 114 8 118 7"],
    stretch: true,
  },
  scratch: {
    viewBox: "0 0 120 30",
    d: ["M4 8 L 22 22 L 40 8 L 58 22 L 76 8 L 94 22 L 112 10"],
    stretch: true,
  },
  circle: {
    viewBox: "0 0 120 92",
    d: [
      "M92 20 C 55 8 18 18 16 46 C 14 72 50 86 80 79 C 108 72 113 44 96 28 C 84 17 66 14 50 19",
    ],
    stretch: false,
  },
  box: {
    viewBox: "0 0 120 72",
    d: [
      "M10 14 C 42 9 82 11 110 14 C 113 32 112 52 110 60 C 80 63 40 62 10 59 C 8 40 9 25 12 12",
    ],
    stretch: false,
  },
  arrow: {
    viewBox: "0 0 100 72",
    d: ["M6 16 C 32 8 70 22 86 52", "M86 52 L 73 45 M86 52 L 91 37"],
    stretch: false,
  },
};

interface ScribbleProps {
  variant?: ScribbleVariant;
  /** Size · color (text-*) · position. Defaults to the single accent. */
  className?: string;
  /** Sweep the stroke on (CSS, motion-safe). Default true. */
  animate?: boolean;
  strokeWidth?: number;
}

/**
 * A hand-drawn marker mark — the warm-hand annotation over the cyber
 * machine. Underline a word, circle a number, strike a line, point an
 * arrow. Pure SVG + a CSS draw-on (see `.scribble-draw` in globals.css),
 * so it's server-renderable and reduced-motion safe. Decorative only.
 */
export function Scribble({
  variant = "underline",
  className,
  animate = true,
  strokeWidth = 2.5,
}: ScribbleProps) {
  const shape = SHAPES[variant];
  return (
    <svg
      aria-hidden="true"
      viewBox={shape.viewBox}
      fill="none"
      preserveAspectRatio={shape.stretch ? "none" : "xMidYMid meet"}
      className={cn(
        "pointer-events-none text-ring",
        animate && "scribble-draw",
        className,
      )}
    >
      {shape.d.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={shape.stretch ? "non-scaling-stroke" : undefined}
        />
      ))}
    </svg>
  );
}
