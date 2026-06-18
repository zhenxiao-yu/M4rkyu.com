"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Perlin-noise line field with cursor repulsion (2D canvas, no WebGL). Theme-aware via MutationObserver on data-theme; reduced-motion paints one static frame; IntersectionObserver pauses off-screen. Port of ReactBits Waves (MIT).

class Grad {
  constructor(public x: number, public y: number, public z: number) {}
  dot2(x: number, y: number) {
    return this.x * x + this.y * y;
  }
}

class Noise {
  grad3: Grad[];
  p: number[];
  perm: number[] = new Array(512);
  gradP: Grad[] = new Array(512);

  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ];
    // 256-entry permutation table from Ken Perlin's reference impl.
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
      21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
      237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
      111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216,
      80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186,
      3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
      17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193,
      238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128,
      195, 78, 66, 215, 61, 156, 180,
    ];
    this.seed(seed);
  }

  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }
  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }
  perlin2(x: number, y: number) {
    let X = Math.floor(x);
    let Y = Math.floor(y);
    x -= X;
    y -= Y;
    X &= 255;
    Y &= 255;
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);
    const u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  }
}

interface WavesProps {
  /** CSS color or token. Defaults to the active `--foreground` token. */
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  xGap?: number;
  yGap?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  /** When true, a tap (touchstart) injects a one-off velocity burst so
    * the field ripples on touch, not only on drag. Default false. */
  touchImpulse?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function Waves({
  lineColor,
  backgroundColor = "transparent",
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
  waveAmpY = 16,
  xGap = 12,
  yGap = 36,
  friction = 0.925,
  tension = 0.005,
  maxCursorMove = 100,
  touchImpulse = false,
  style,
  className,
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  // Only reduced-motion users get the single static frame. Everyone else —
  // including touch — gets the live, cursor-/touch-reactive field (the
  // `touchmove` handler below repels the lines under a finger). The
  // per-frame cost stays bounded: a 30fps gate, a DPR cap (1.5), hard grid
  // caps, and an IntersectionObserver that pauses it whenever it scrolls
  // off-screen, so an idle background never burns the phone's battery.
  const lite = reduce;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve color via probe span so theme tokens (e.g. `var(--foreground)`)
    // turn into rgb strings. Re-read on theme toggle.
    function readColor(): string {
      const probe = document.createElement("span");
      probe.style.color = lineColor ?? "var(--foreground)";
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      // Drop alpha; we'll set it via globalAlpha if needed.
      return c;
    }
    let strokeColor = readColor();
    const themeObserver = new MutationObserver(() => {
      strokeColor = readColor();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    interface Point {
      x: number;
      y: number;
      wave: { x: number; y: number };
      cursor: { x: number; y: number; vx: number; vy: number };
    }
    interface Mouse {
      x: number;
      y: number;
      lx: number;
      ly: number;
      sx: number;
      sy: number;
      v: number;
      vs: number;
      a: number;
      set: boolean;
    }

    const noise = new Noise(Math.random());
    let lines: Point[][] = [];
    const mouse: Mouse = { x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false };
    const bounds = { width: 0, height: 0, left: 0, top: 0 };
    let raf = 0;
    let running = false;
    // Throttle the redraw to ~30fps. The drift is ambient and time-based
    // (driven by the rAF timestamp), so halving the redraw rate is
    // imperceptible yet cuts the per-second Perlin + canvas cost in half.
    let lastRender = 0;
    const FRAME_MS = 1000 / 30;

    function setSize() {
      const rect = container!.getBoundingClientRect();
      bounds.width = rect.width;
      bounds.height = rect.height;
      bounds.left = rect.left;
      bounds.top = rect.top;
      // Cap DPR: this is a faint 1px ambient line field, so rasterizing it
      // at native 2–3× on Retina/4K is wasted pixel work (it was the bulk
      // of the per-frame cost on high-DPI displays). 1.5 stays crisp enough.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = rect.width + "px";
      canvas!.style.height = rect.height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function setLines() {
      lines = [];
      const oWidth = bounds.width + 200;
      const oHeight = bounds.height + 30;
      // Hard-cap the grid so the per-frame cost (one Perlin eval + physics +
      // path segment per point) stays bounded on wide / 4K displays, where
      // the raw `oWidth / xGap` would otherwise scale into thousands of
      // points and stall the frame. The effective gap widens to fill the
      // space; on normal viewports the cap never binds and `xGap`/`yGap`
      // apply as authored.
      const MAX_LINES = 60;
      const MAX_POINTS = 28;
      const totalLines = Math.min(MAX_LINES, Math.ceil(oWidth / xGap));
      const totalPoints = Math.min(MAX_POINTS, Math.ceil(oHeight / yGap));
      const effXGap = oWidth / totalLines;
      const effYGap = oHeight / totalPoints;
      const xStart = (bounds.width - effXGap * totalLines) / 2;
      const yStart = (bounds.height - effYGap * totalPoints) / 2;
      for (let i = 0; i <= totalLines; i++) {
        const pts: Point[] = [];
        for (let j = 0; j <= totalPoints; j++) {
          pts.push({
            x: xStart + effXGap * i,
            y: yStart + effYGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }
        lines.push(pts);
      }
    }
    function movePoints(t: number) {
      for (const pts of lines) {
        for (const p of pts) {
          const move = noise.perlin2((p.x + t * waveSpeedX) * 0.002, (p.y + t * waveSpeedY) * 0.0015) * 12;
          p.wave.x = Math.cos(move) * waveAmpX;
          p.wave.y = Math.sin(move) * waveAmpY;
          const dx = p.x - mouse.sx;
          const dy = p.y - mouse.sy;
          const dist = Math.hypot(dx, dy);
          const l = Math.max(175, mouse.vs);
          if (dist < l) {
            const s = 1 - dist / l;
            const f = Math.cos(dist * 0.001) * s;
            p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065;
            p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065;
          }
          p.cursor.vx += (0 - p.cursor.x) * tension;
          p.cursor.vy += (0 - p.cursor.y) * tension;
          p.cursor.vx *= friction;
          p.cursor.vy *= friction;
          p.cursor.x += p.cursor.vx * 2;
          p.cursor.y += p.cursor.vy * 2;
          p.cursor.x = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.x));
          p.cursor.y = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.y));
        }
      }
    }
    function moved(p: Point, withCursor: boolean) {
      const x = p.x + p.wave.x + (withCursor ? p.cursor.x : 0);
      const y = p.y + p.wave.y + (withCursor ? p.cursor.y : 0);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    }
    function drawLines() {
      ctx!.clearRect(0, 0, bounds.width, bounds.height);
      ctx!.beginPath();
      ctx!.strokeStyle = strokeColor;
      ctx!.lineWidth = 1;
      for (const points of lines) {
        let p1 = moved(points[0], false);
        ctx!.moveTo(p1.x, p1.y);
        for (let idx = 0; idx < points.length; idx++) {
          const isLast = idx === points.length - 1;
          p1 = moved(points[idx], !isLast);
          const p2 = moved(points[idx + 1] || points[points.length - 1], !isLast);
          ctx!.lineTo(p1.x, p1.y);
          if (isLast) ctx!.moveTo(p2.x, p2.y);
        }
      }
      ctx!.stroke();
    }
    function tick(t: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      // 30fps gate — drop the mouse smoothing + Perlin move + redraw on
      // frames that arrive sooner than the interval; the loop itself
      // keeps ticking at display rate.
      if (t - lastRender < FRAME_MS) return;
      lastRender = t;
      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;
      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const d = Math.hypot(dx, dy);
      mouse.v = d;
      mouse.vs += (d - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy, dx);
      movePoints(t);
      drawLines();
    }
    function onResize() {
      setSize();
      setLines();
    }
    function updateMouse(x: number, y: number) {
      mouse.x = x - bounds.left;
      mouse.y = y - bounds.top;
      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.set = true;
      }
    }
    function onMouseMove(e: MouseEvent) {
      updateMouse(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      if (touch) updateMouse(touch.clientX, touch.clientY);
    }
    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      updateMouse(touch.clientX, touch.clientY);
      if (touchImpulse) {
        // A bare tap carries no cursor velocity, so the field wouldn't
        // react. Seed a one-off velocity burst (decays via the tick's
        // `vs` smoothing) plus a random shove angle so each touch ripples
        // the lines outward.
        mouse.vs = Math.max(mouse.vs, 64);
        mouse.a = Math.random() * Math.PI * 2;
      }
    }

    setSize();
    setLines();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    if (lite) {
      // One static frame, no ticker.
      movePoints(0);
      drawLines();
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchstart", onTouchStart);
        themeObserver.disconnect();
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      themeObserver.disconnect();
    };
  }, [
    lineColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    xGap,
    yGap,
    friction,
    tension,
    maxCursorMove,
    touchImpulse,
    lite,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("absolute inset-0 size-full overflow-hidden", className)}
      style={{ backgroundColor, ...style }}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
