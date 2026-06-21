"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  born: number;
  /** 0 → primary ink, 1 → second ink (two-ink scatter). */
  ink: 0 | 1;
}

interface Stamp {
  x: number;
  y: number;
  born: number;
  life: number;
  /** Peak ripple radius in px. */
  max: number;
}

/**
 * Global tactile-ink pointer layer. One full-viewport 2D canvas
 * (pointer-events:none, fixed) that paints three on-brand effects, all
 * theme-tinted from the live `--ring` / `--ring-2` inks:
 *
 *   - Click / tap → an ink "stamp": an expanding `--ring` ripple plus a
 *     slightly misregistered `--ring-2` ripple (the risograph two-ink
 *     overprint), a soft central ink blot, and a short scatter of two-ink
 *     sparks. Taps fire a touch-sized stamp so coarse pointers feel it too.
 *   - Hover (fine pointer only) → a soft ink halo that eases in under the
 *     cursor *only while over an interactive element* (links, buttons,
 *     cards, fields) and eases out otherwise. Purposeful, not the constant
 *     floating ring that was removed earlier for reading as an artifact.
 *
 * Reduced motion: renders nothing. Colours re-read on theme/palette change.
 */
export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const stampsRef = useRef<Stamp[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const TAU = Math.PI * 2;
    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function readInk(varName: string, fallback: string) {
      const probe = document.createElement("span");
      probe.style.color = `var(${varName})`;
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      const match = color.match(/rgba?\(([^)]+)\)/);
      return match
        ? match[1].split(",").slice(0, 3).join(",").trim()
        : fallback;
    }
    let ink1 = readInk("--ring", "34, 211, 238");
    let ink2 = readInk("--ring-2", ink1);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const themeObserver = new MutationObserver(() => {
      ink1 = readInk("--ring", "34, 211, 238");
      ink2 = readInk("--ring-2", ink1);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });

    // —— Hover halo (fine pointer only) ————————————————————————————————
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const hover = { x: 0, y: 0, alpha: 0, target: 0 };
    const INTERACTIVE =
      'a, button, [role="button"], [data-card-link], summary, label, input, select, textarea, [data-ink-hover]';
    let probing = false;
    function onMove(event: MouseEvent) {
      hover.x = event.clientX;
      hover.y = event.clientY;
      // elementFromPoint is the per-move cost; throttle to one rAF.
      if (probing) return;
      probing = true;
      requestAnimationFrame(() => {
        probing = false;
        const el = document.elementFromPoint(hover.x, hover.y);
        hover.target = el && el.closest(INTERACTIVE) ? 1 : 0;
      });
    }
    if (finePointer) {
      window.addEventListener("mousemove", onMove, { passive: true });
    }

    // —— Press stamp + sparks ——————————————————————————————————————————
    function onClick(event: MouseEvent) {
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const now = performance.now();

      stampsRef.current.push({
        x: event.clientX,
        y: event.clientY,
        born: now,
        life: touch ? 640 : 560,
        max: touch ? 64 : 48,
      });

      const count = touch ? 9 : 16;
      const speed = 230;
      for (let i = 0; i < count; i++) {
        const angle = (TAU * i) / count + Math.random() * 0.3;
        const v = speed * (0.55 + Math.random() * 0.55);
        sparksRef.current.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 560 + Math.random() * 220,
          born: now,
          ink: (i % 2) as 0 | 1,
        });
      }
    }
    document.addEventListener("click", onClick);

    let raf = 0;
    let prev = performance.now();
    function loop(now: number) {
      const dt = (now - prev) / 1000;
      prev = now;
      ctx!.clearRect(0, 0, width, height);

      // Hover halo — eases toward 1 over interactive elements, 0 otherwise.
      hover.alpha += (hover.target - hover.alpha) * 0.16;
      if (finePointer && hover.alpha > 0.01) {
        const r = 32;
        const grad = ctx!.createRadialGradient(
          hover.x,
          hover.y,
          0,
          hover.x,
          hover.y,
          r,
        );
        grad.addColorStop(0, `rgba(${ink1}, ${(0.18 * hover.alpha).toFixed(3)})`);
        grad.addColorStop(0.6, `rgba(${ink1}, ${(0.06 * hover.alpha).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${ink1}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(hover.x, hover.y, r, 0, TAU);
        ctx!.fill();
      }

      // Press stamps — two-ink overprint ripple + central blot.
      const liveStamps: Stamp[] = [];
      for (const s of stampsRef.current) {
        const age = now - s.born;
        if (age > s.life) continue;
        const t = Math.max(0, age / s.life); // rAF ts can precede born
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const a = 1 - t;

        // Primary-ink ripple.
        ctx!.strokeStyle = `rgba(${ink1}, ${(a * 0.9).toFixed(3)})`;
        ctx!.lineWidth = 2.4 * (1 - t * 0.7);
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.max * ease, 0, TAU);
        ctx!.stroke();

        // Second-ink ripple, misregistered — the overprint signature.
        ctx!.strokeStyle = `rgba(${ink2}, ${(a * 0.65).toFixed(3)})`;
        ctx!.lineWidth = 2 * (1 - t * 0.7);
        ctx!.beginPath();
        ctx!.arc(s.x + 2.5, s.y - 2, s.max * ease * 0.92, 0, TAU);
        ctx!.stroke();

        // Central ink blot — blooms fast, fades faster.
        const bloom = 1 - Math.pow(1 - Math.min(1, t * 1.6), 2);
        const br = 5 + 16 * bloom;
        const ba = (1 - Math.min(1, t * 2.2)) * 0.4;
        if (ba > 0.001) {
          const bg = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, br);
          bg.addColorStop(0, `rgba(${ink1}, ${ba.toFixed(3)})`);
          bg.addColorStop(1, `rgba(${ink1}, 0)`);
          ctx!.fillStyle = bg;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, br, 0, TAU);
          ctx!.fill();
        }
        liveStamps.push(s);
      }
      stampsRef.current = liveStamps;

      // Sparks — drag + gravity, two-ink.
      const liveSparks: Spark[] = [];
      for (const s of sparksRef.current) {
        const age = now - s.born;
        if (age > s.life) continue;
        const t = Math.max(0, age / s.life); // rAF ts can precede born
        s.vx *= 0.94;
        s.vy = s.vy * 0.94 + 90 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx!.fillStyle = `rgba(${s.ink ? ink2 : ink1}, ${((1 - t) * 0.9).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 2 * (1 - t * 0.6), 0, TAU);
        ctx!.fill();
        liveSparks.push(s);
      }
      sparksRef.current = liveSparks;

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      if (finePointer) window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, [reduce]);

  // Canvas always renders so SSR and client markup match; the effect above
  // is the reduced-motion gate (it bails before attaching listeners or
  // painting, leaving an inert invisible canvas). A render-level branch on
  // useReducedMotion() caused a hydration mismatch — the server painted the
  // canvas while the client under reduced-motion rendered null.

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-70 size-full"
    />
  );
}
