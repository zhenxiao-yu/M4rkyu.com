"use client";

// Adapted from reactbits.dev (MIT)
// Source: https://reactbits.dev/backgrounds/grid-distortion?mouse=0.1
//
// The upstream React Bits implementation uses three.js. We re-port the
// shader / data-texture warp algorithm onto OGL (already a dependency
// via `galaxy.tsx`) to avoid adding a multi-hundred-kB bundle. The
// algorithm is unchanged: a low-resolution `RGBA32F` data texture
// stores per-grid-cell velocity, mouse movement injects velocity into
// nearby cells, and a fragment shader samples that data texture as
// an offset into the source image's UVs.

import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Mesh, Plane, Program, Renderer, Texture } from "ogl";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

export interface GridDistortionProps {
  /** Per-axis cell count of the velocity data texture. */
  grid?: number;
  /** Mouse influence radius as a fraction of `grid`. */
  mouse?: number;
  /** Velocity injection strength per pointer-move. */
  strength?: number;
  /** Velocity decay per frame (0–1; closer to 1 = longer ripples). */
  relaxation?: number;
  /** Source image whose UVs are warped. PNG / JPG / data-URL. */
  imageSrc?: string;
  className?: string;
}

const vertexShader = /* glsl */ `
attribute vec2 uv;
attribute vec3 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec2 uContainerAspect; // (cw / max, ch / max) — for cover-fit
uniform vec2 uImageAspect;     // (iw / max, ih / max)
varying vec2 vUv;

void main() {
  // Cover-fit the source texture without distortion. We compute the
  // ratio of container-aspect to image-aspect on each axis and crop
  // the dominant one centered on 0.5.
  vec2 ratio = uContainerAspect / uImageAspect;
  float scale = min(ratio.x, ratio.y);
  vec2 fitted = (vUv - 0.5) * (ratio / scale) + 0.5;

  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, fitted - 0.02 * offset.rg);
}
`;

const DEFAULT_GRID = 15;
const DEFAULT_MOUSE = 0.1;
const DEFAULT_STRENGTH = 0.15;
const DEFAULT_RELAXATION = 0.9;

// Tiny inlined 4×4 dot texture in soft cyan — derived from the
// `--ring` token, low-contrast so the warp reads as ambient depth
// rather than competing with foreground content. Generated once at
// module load; reused across instances.
const DEFAULT_IMAGE_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#0a1418"/>
      <g fill="#67e8f9" fill-opacity="0.18">
        ${Array.from({ length: 4 }, (_, gy) =>
          Array.from(
            { length: 4 },
            (_, gx) =>
              `<circle cx="${gx * 16 + 8}" cy="${gy * 16 + 8}" r="2.4"/>`,
          ).join(""),
        ).join("")}
      </g>
      <g stroke="#67e8f9" stroke-opacity="0.08" stroke-width="0.5" fill="none">
        ${Array.from({ length: 5 }, (_, i) =>
          `<line x1="0" y1="${i * 16}" x2="64" y2="${i * 16}"/>
           <line x1="${i * 16}" y1="0" x2="${i * 16}" y2="64"/>`,
        ).join("")}
      </g>
    </svg>`,
  );

export function GridDistortion({
  grid = DEFAULT_GRID,
  mouse = DEFAULT_MOUSE,
  strength = DEFAULT_STRENGTH,
  relaxation = DEFAULT_RELAXATION,
  imageSrc = DEFAULT_IMAGE_SRC,
  className,
}: GridDistortionProps) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  // Touch devices have no hover signal to inject velocity, so the
  // shader would just sit idle anyway. Skip the mount entirely.
  const finePointer = useMediaQuery("(pointer: fine)");
  const enabled = !reduceMotion && finePointer;

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let raf = 0;
    let running = false;
    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let dataArray: Float32Array | null = null;
    let dataTexture: Texture | null = null;
    let imageTexture: Texture | null = null;
    let program: Program | null = null;
    let canvas: HTMLCanvasElement | null = null;

    const size = Math.max(2, Math.floor(grid));
    const mouseState = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vX: 0,
      vY: 0,
    };
    const imageAspect = { w: 1, h: 1 };

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL — bail silently. The bento still works without the
      // backdrop.
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    // Velocity data texture — one RGBA float per grid cell. We seed
    // with a small random offset so the first frame has subtle
    // motion even before the cursor enters.
    dataArray = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      dataArray[i * 4] = Math.random() * 255 - 125;
      dataArray[i * 4 + 1] = Math.random() * 255 - 125;
    }

    dataTexture = new Texture(gl, {
      image: dataArray,
      width: size,
      height: size,
      // RGBA32F float texture — supported natively in WebGL2 (OGL
      // default). If for some reason we drop to WebGL1, OGL routes
      // the same `gl.FLOAT` type through OES_texture_float when
      // available.
      type: gl.FLOAT,
      format: gl.RGBA,
      internalFormat: renderer.isWebgl2
        ? (gl as WebGL2RenderingContext).RGBA32F
        : gl.RGBA,
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
      generateMipmaps: false,
      flipY: false,
      unpackAlignment: 1,
    });

    imageTexture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!imageTexture) return;
      imageTexture.image = img;
      imageTexture.needsUpdate = true;
      imageAspect.w = img.naturalWidth || 1;
      imageAspect.h = img.naturalHeight || 1;
      handleResize();
    };
    img.src = imageSrc;

    const geometry = new Plane(gl, { width: 2, height: 2 });

    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      uniforms: {
        uDataTexture: { value: dataTexture },
        uTexture: { value: imageTexture },
        uContainerAspect: { value: new Float32Array([1, 1]) },
        uImageAspect: { value: new Float32Array([1, 1]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function handleResize() {
      if (!container || !renderer || !program) return;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      const maxC = Math.max(w, h);
      (program.uniforms.uContainerAspect.value as Float32Array)[0] = w / maxC;
      (program.uniforms.uContainerAspect.value as Float32Array)[1] = h / maxC;
      const maxI = Math.max(imageAspect.w, imageAspect.h);
      (program.uniforms.uImageAspect.value as Float32Array)[0] =
        imageAspect.w / maxI;
      (program.uniforms.uImageAspect.value as Float32Array)[1] =
        imageAspect.h / maxI;
    }

    function onPointerMove(event: PointerEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      mouseState.x = x;
      mouseState.y = y;
      mouseState.prevX = x;
      mouseState.prevY = y;
    }

    function onPointerLeave() {
      mouseState.vX = 0;
      mouseState.vY = 0;
    }

    function frame() {
      if (!running || !renderer || !program || !dataTexture || !dataArray) {
        return;
      }
      // Relax stored velocities — without this every cell would
      // pile up to infinity in tight pointer scribbles.
      for (let i = 0; i < size * size; i++) {
        dataArray[i * 4] *= relaxation;
        dataArray[i * 4 + 1] *= relaxation;
      }
      // Inject the cursor's recent velocity into a radius around
      // its grid position.
      const gridMouseX = size * mouseState.x;
      const gridMouseY = size * mouseState.y;
      const maxDist = size * mouse;
      const maxDistSq = maxDist * maxDist;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const dx = gridMouseX - i;
          const dy = gridMouseY - j;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const idx = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distSq + 0.0001), 10);
            dataArray[idx] += strength * 100 * mouseState.vX * power;
            dataArray[idx + 1] -= strength * 100 * mouseState.vY * power;
          }
        }
      }
      dataTexture.needsUpdate = true;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    container.appendChild(canvas);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", handleResize);
    }

    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    // Don't burn a frame loop when the bento is off-screen or the
    // tab is hidden — the warp is purely ambient, no missed input
    // to catch up on.
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(container);

    function onVisibility() {
      if (document.hidden) stop();
      else if (observer && container) {
        // Re-evaluate intersection on tab refocus by toggling the
        // observer. Cheaper than a manual rect check.
        observer.unobserve(container);
        observer.observe(container);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    handleResize();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
      observer = null;
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      } else {
        window.removeEventListener("resize", handleResize);
      }
      container?.removeEventListener("pointermove", onPointerMove);
      container?.removeEventListener("pointerleave", onPointerLeave);
      if (canvas && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
      // OGL exposes no formal `dispose()` — release GL resources via
      // the lose-context extension, then drop our refs so GC can
      // reclaim the typed arrays. Matches the `galaxy.tsx` cleanup.
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      dataArray = null;
      dataTexture = null;
      imageTexture = null;
      program = null;
      canvas = null;
      renderer = null;
    };
    // `reactId` keeps the unmount path stable across StrictMode
    // double-invocation in dev (different effect run, same logical
    // instance).
  }, [enabled, grid, mouse, strength, relaxation, imageSrc, reactId]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}

export default GridDistortion;
