"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

// Flowing silk threads (OGL). 40 Perlin-driven lines that wave across the
// field and bend toward the cursor (smoothed). Transparent — composites over
// whatever sits behind it. Tinted to a CSS-var ink (`--foreground` by default)
// and re-tinted live on theme/palette change; reduced-motion / touch paint one
// static frame; IntersectionObserver pauses the RAF off-screen. Port of
// ReactBits Threads (MIT), adapted to the repo's house style.

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
    * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
    * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
  return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
  float split_offset = (perc * 0.4);
  float split_point = 0.1 + split_offset;

  float amplitude_normal = smoothstep(split_point, 0.7, st.x);
  float amplitude_strength = 0.5;
  float finalAmplitude = amplitude_normal * amplitude_strength
    * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

  float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
  float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

  float xnoise = mix(
    Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
    Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
    st.x * 0.3
  );

  float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

  float line_start = smoothstep(
    y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
    y,
    st.y
  );

  float line_end = smoothstep(
    y,
    y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
    st.y
  );

  return clamp(
    (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
    0.0,
    1.0
  );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;

  float line_strength = 1.0;
  for (int i = 0; i < u_line_count; i++) {
    float p = float(i) / float(u_line_count);
    line_strength *= (1.0 - lineFn(
      uv,
      u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
      p,
      (PI * 1.0) * p,
      uMouse,
      iTime,
      uAmplitude,
      uDistance
    ));
  }

  float colorVal = 1.0 - line_strength;
  fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
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

interface ThreadsProps {
  /** CSS var the threads are tinted with. Default `--foreground`. */
  colorVar?: string;
  amplitude?: number;
  distance?: number;
  className?: string;
}

export function Threads({
  colorVar = "--foreground",
  amplitude = 1,
  distance = 0,
  className,
}: ThreadsProps) {
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
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Color(1, 1, 1) },
        uColor: { value: new Color(...readVarRgb(colorVar)) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
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
      program.uniforms.iResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      );
    };
    const ro = new ResizeObserver(resize);
    ro.observe(ctn);
    resize();

    const current: [number, number] = [0.5, 0.5];
    const target: [number, number] = [0.5, 0.5];
    const interactive = finePointer && !reduce;

    function frame(t: number) {
      if (interactive) {
        current[0] += 0.05 * (target[0] - current[0]);
        current[1] += 0.05 * (target[1] - current[1]);
        program.uniforms.uMouse.value[0] = current[0];
        program.uniforms.uMouse.value[1] = current[1];
      }
      program.uniforms.iTime.value = t * 0.001;
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

    if (reduce) frame(0);
    else raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      const r = ctn.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      target[0] = 0.5;
      target[1] = 0.5;
    };
    if (interactive) {
      ctn.addEventListener("mousemove", onMove);
      ctn.addEventListener("mouseleave", onLeave);
    }

    const themeObs = new MutationObserver(() => {
      const [r, g, b] = readVarRgb(colorVar);
      program.uniforms.uColor.value = new Color(r, g, b);
      if (reduce) frame(0);
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
      if (interactive) {
        ctn.removeEventListener("mousemove", onMove);
        ctn.removeEventListener("mouseleave", onLeave);
      }
      if (ctn.contains(canvas)) ctn.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [colorVar, amplitude, distance, reduce, finePointer]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("size-full", className)} />
  );
}
