"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { DoubleSide, Vector2, Vector3, type ShaderMaterial } from "three";
import { useThemeInks, type ThemeInks } from "@/lib/hooks/use-theme-inks";
import { cn } from "@/lib/utils";

/**
 * Hero contour field — a Three.js / R3F continuation of the 2-D Perlin
 * Waves language, but in real depth: a displaced plane drawn as a faint
 * wireframe terrain that ripples over time, lifts a soft mound under the
 * cursor, and recedes into atmospheric fog. Colours are pulled live from
 * the active palette's inks (`--foreground` base, `--ring` crest glow,
 * `--ring-3` depth haze) and lerped on theme/palette change — three inks,
 * never a fourth.
 *
 * This module is heavy (it pulls in three), so it is only ever reached
 * through the gated dynamic import in `hero-backdrop.tsx`: touch and
 * reduced-motion clients never fetch it, and it never runs on the server.
 * The discipline mirrors the OGL `galaxy.tsx`: DPR capped at 1.5, the
 * frameloop parked when the hero scrolls off-screen, and the WebGL
 * context released on unmount (R3F owns that teardown).
 */

// Simplex noise (Ashima / Stefan Gustavson, MIT) — used in the vertex
// stage to displace the plane. Kept verbatim; it's a well-known kernel.
const simplexNoise = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ShaderMaterial injects `position`, `modelViewMatrix`, `projectionMatrix`
// and the float precision header for us — so we neither declare nor
// redeclare them here.
const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uAmp;
varying float vHeight;
varying float vFade;
${simplexNoise}
void main() {
  vec3 p = position;
  // Two octaves of drift — a slow base swell plus a faster, offset ripple.
  float n = snoise(vec3(p.x * 0.42, p.y * 0.42, uTime * 0.11));
  n += 0.45 * snoise(vec3(p.x * 0.95 + 11.0, p.y * 0.95, uTime * 0.17));
  float h = n * uAmp;
  // Soft mound that lifts under the cursor (plane-space gaussian).
  vec2 m = uMouse * 3.4;
  float d = distance(p.xy, m);
  h += exp(-d * d * 0.22) * 0.7 * uAmp;
  p.z += h;
  vHeight = h;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // Atmospheric fade by view depth — far wires dissolve into the haze.
  vFade = smoothstep(-5.6, -0.4, mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

// Colours arrive as sRGB floats straight from the CSS tokens and are
// written to the sRGB framebuffer untouched (toneMapped is off), so the
// field matches the palette exactly — no colour-management round-trip.
const fragmentShader = /* glsl */ `
uniform vec3 uForeground;
uniform vec3 uRing;
uniform vec3 uRing3;
uniform vec3 uGround;
uniform float uOpacity;
varying float vHeight;
varying float vFade;
void main() {
  // Near wires: ink base, crests glowing toward the accent.
  float crest = smoothstep(0.04, 0.55, vHeight);
  vec3 col = mix(uForeground, uRing, crest * 0.9);
  // Layered depth so the field reads as printed on the active palette:
  // mid distance hazes through the tertiary ink, deep distance dissolves
  // into the palette's own ground (paper on riso, phosphor-black on
  // terminal, clean stock on editorial).
  col = mix(uRing3, col, smoothstep(0.0, 0.55, vFade));
  col = mix(uGround, col, smoothstep(0.0, 0.82, vFade));
  float alpha = uOpacity * mix(0.14, 1.0, vFade);
  gl_FragColor = vec4(col, alpha);
}
`;

// 64×64 grid: dense enough to read as a topographic mesh, sparse enough
// that the wireframe stays crisp lines rather than a noisy smear, and
// cheap enough to hold frame on an integrated GPU.
const SEG = 64;

function ContourField({
  inksRef,
  amp,
}: {
  inksRef: RefObject<ThemeInks>;
  amp: number;
}) {
  const materialRef = useRef<ShaderMaterial>(null);
  const targetPointer = useRef(new Vector2(0, 0));
  const smoothPointer = useRef(new Vector2(0, 0));
  // Reused scratch vectors for the per-frame colour lerp (no allocations
  // in the loop). Held in a ref — refs are the mutable lane the
  // react-hooks rules expect; a useMemo'd value must not be mutated.
  const scratch = useRef({
    fg: new Vector3(),
    ring: new Vector3(),
    ring3: new Vector3(),
    ground: new Vector3(),
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
      uAmp: { value: amp },
      uForeground: { value: new Vector3(0.5, 0.5, 0.5) },
      uRing: { value: new Vector3(0.5, 0.5, 0.5) },
      uRing3: { value: new Vector3(0.5, 0.5, 0.5) },
      uGround: { value: new Vector3(0.5, 0.5, 0.5) },
      uOpacity: { value: 0.6 },
    }),
    [amp],
  );

  useEffect(() => {
    function onMove(e: PointerEvent) {
      // Normalise to clip space (-1..1) against the viewport; the mound
      // tracks the cursor wherever it is over the full-bleed hero.
      targetPointer.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    // Mutate uniforms through the material ref (a frame callback, not
    // render) so we never touch the memoised `uniforms` object directly.
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    // Clamp delta so a backgrounded tab returning doesn't jump the field.
    u.uTime.value += Math.min(delta, 0.05);

    smoothPointer.current.lerp(targetPointer.current, 0.06);
    u.uMouse.value.copy(smoothPointer.current);

    const inks = inksRef.current;
    if (inks) {
      const s = scratch.current;
      u.uForeground.value.lerp(s.fg.fromArray(inks.foreground.float), 0.08);
      u.uRing.value.lerp(s.ring.fromArray(inks.ring.float), 0.08);
      u.uRing3.value.lerp(s.ring3.fromArray(inks.ring3.float), 0.08);
      u.uGround.value.lerp(s.ground.fromArray(inks.background.float), 0.08);
    }
  });

  return (
    <mesh rotation={[-0.66, 0, 0]} position={[0, -0.15, 0]}>
      <planeGeometry args={[10, 10, SEG, SEG]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe
        transparent
        depthWrite={false}
        toneMapped={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

export function HeroScene({ className }: { className?: string }) {
  const { inksRef } = useThemeInks();
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // Park the render loop whenever the hero scrolls out of view.
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    // Cross-fade in on the next frame so the field arrives, it doesn't pop.
    const id = requestAnimationFrame(() => setEntered(true));
    return () => {
      io.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full transition-opacity duration-1200 ease-(--ease-premium) motion-reduce:transition-none",
        entered ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.5, 4.5], fov: 44 }}
      >
        {/* reduced-motion shouldn't reach here (the backdrop gates it), but
          * if it ever does, flatten the field to a still surface. */}
        <ContourField inksRef={inksRef} amp={reduced ? 0 : 0.64} />
      </Canvas>
    </div>
  );
}
