"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

// Iridescent flowing sheen (OGL, single triangle + fragment shader). The
// pattern is modulated by a CSS-var ink (`--ring` by default) so it reads as
// an accent-toned holographic field rather than a free rainbow, and re-tints
// live on theme/palette change. Mouse shifts the field; reduced-motion / touch
// paint one static frame; IntersectionObserver pauses the RAF off-screen.
// Port of ReactBits Iridescence (MIT), adapted to the repo's house style.

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Resolve a CSS custom property to a 0–1 RGB triplet via a probe span. */
function readVarRgb(name: string): [number, number, number] {
  if (typeof document === "undefined") return [1, 1, 1];
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  const m = c.match(/[\d.]+/g);
  if (!m) return [1, 1, 1];
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
}

interface IridescenceProps {
  /** CSS var the sheen is tinted toward. Default `--ring`. */
  colorVar?: string;
  speed?: number;
  amplitude?: number;
  className?: string;
}

export function Iridescence({
  colorVar = "--ring",
  speed = 1,
  amplitude = 0.12,
  className,
}: IridescenceProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");

  useEffect(() => {
    const ctn = ref.current;
    if (!ctn) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true });
    } catch {
      // No WebGL — bail; the switcher scrim still carries the hero.
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);
    const mouse = new Float32Array([0.5, 0.5]);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...readVarRgb(colorVar)) },
        uResolution: { value: new Color(1, 1, 1) },
        uMouse: { value: mouse },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    ctn.appendChild(canvas);

    const resize = () => {
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.uResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      );
    };
    const ro = new ResizeObserver(resize);
    ro.observe(ctn);
    resize();

    function frame(t: number) {
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }

    let raf = 0;
    let visible = true;
    function loop(t: number) {
      raf = 0;
      frame(t);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduce && !raf) raf = requestAnimationFrame(loop);
      },
      { threshold: 0 },
    );
    io.observe(ctn);

    if (reduce) frame(2200);
    else raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      const r = ctn.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width;
      mouse[1] = 1 - (e.clientY - r.top) / r.height;
    };
    const interactive = finePointer && !reduce;
    if (interactive) ctn.addEventListener("mousemove", onMove);

    // Re-tint when the user changes theme or palette while the hero is open.
    const themeObs = new MutationObserver(() => {
      const [r, g, b] = readVarRgb(colorVar);
      program.uniforms.uColor.value = new Color(r, g, b);
      if (reduce) frame(2200);
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      if (interactive) ctn.removeEventListener("mousemove", onMove);
      if (ctn.contains(canvas)) ctn.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [colorVar, speed, amplitude, reduce, finePointer]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("size-full", className)} />
  );
}
