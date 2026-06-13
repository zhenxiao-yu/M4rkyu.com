"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * The hero's switchable backdrop — the site's centre wow-piece. Five
 * mouse-interactive fields the visitor cycles with HUD arrows; the choice
 * persists to localStorage. Each field is `next/dynamic` + `ssr: false`, so
 * only the selected one's WebGL/canvas code is ever fetched (initial bundle
 * stays ~Galaxy-only) and exactly one renders at a time.
 *
 * Defaults & guards:
 *   - Fine pointer + motion → full switcher (Galaxy default).
 *   - Reduced motion → defaults to the lightweight Waves field.
 *   - Coarse pointer (touch) → switcher + controls still shown (touch drives
 *     Galaxy via pointermove, Waves via touchmove); defaults to the
 *     lightweight Waves to respect the mobile GPU budget, but switchable.
 * `useMediaQuery` is `useSyncExternalStore`-backed, so the post-hydration
 * flip from the server snapshot is sanctioned (no mismatch). The backdrop +
 * controls only render once `mounted`, keeping SSR and first client paint
 * identical.
 */

const Galaxy = dynamic(
  () => import("@/components/ui/magic/galaxy").then((m) => m.Galaxy),
  { ssr: false },
);
const Iridescence = dynamic(
  () => import("@/components/ui/magic/iridescence").then((m) => m.Iridescence),
  { ssr: false },
);
const Threads = dynamic(
  () => import("@/components/ui/magic/threads").then((m) => m.Threads),
  { ssr: false },
);
const GridDistortion = dynamic(
  () =>
    import("@/components/ui/magic/grid-distortion").then(
      (m) => m.GridDistortion,
    ),
  { ssr: false },
);
const Waves = dynamic(
  () => import("@/components/ui/magic/waves").then((m) => m.Waves),
  { ssr: false },
);

interface BackdropDef {
  id: string;
  /** i18n key under `Home.backdrops.*`. */
  key: string;
  render: () => ReactNode;
  /** Per-field wrapper treatment (Galaxy inverts in light mode). */
  wrapperClassName?: string;
}

const BACKDROPS: BackdropDef[] = [
  {
    id: "galaxy",
    key: "galaxy",
    wrapperClassName: "invert dark:invert-0",
    render: () => (
      <Galaxy
        density={0.5}
        hueShift={105}
        speed={0.6}
        glowIntensity={0.2}
        saturation={0.15}
        twinkleIntensity={0.1}
        starSpeed={0.4}
        rotationSpeed={0.05}
        mouseInteraction
        mouseRepulsion={false}
        transparent
      />
    ),
  },
  { id: "iridescence", key: "iridescence", render: () => <Iridescence /> },
  { id: "threads", key: "threads", render: () => <Threads /> },
  { id: "grid", key: "grid", render: () => <ThemedGrid /> },
  { id: "waves", key: "waves", render: () => <Waves /> },
];

/**
 * Grid-Warp fed a live tri-ink mesh gradient instead of the component's
 * default cyan grid — the mouse ripples then warp the active theme's own
 * inks (vermilion/cobalt/marigold …) over its paper, a premium liquid-
 * gradient field. Rebuilt when the theme/palette changes (setState lives in
 * the observer callback, never synchronously in the effect — lint-clean).
 * Only mounts when Grid-Warp is the active field, so the work is lazy.
 */
function ThemedGrid() {
  const [imageSrc, setImageSrc] = useState(buildGridGradient);
  useEffect(() => {
    const update = () => setImageSrc(buildGridGradient());
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });
    return () => obs.disconnect();
  }, []);
  return (
    <GridDistortion
      imageSrc={imageSrc}
      mouse={0.12}
      strength={0.18}
      relaxation={0.92}
    />
  );
}

/** Resolve a CSS custom property to its computed `rgb(...)` string. */
function readColor(name: string): string {
  if (typeof document === "undefined") return "#000";
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c || "#000";
}

/** A tri-ink soft mesh gradient over the theme paper, as an SVG data URI —
 * the source image Grid-Warp distorts. */
function buildGridGradient(): string {
  const bg = readColor("--background");
  const ring = readColor("--ring");
  const ring2 = readColor("--ring-2");
  const ring3 = readColor("--ring-3");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${bg}"/>
  <defs>
    <radialGradient id="a" cx="22%" cy="16%" r="64%"><stop offset="0%" stop-color="${ring}" stop-opacity="0.95"/><stop offset="100%" stop-color="${ring}" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="84%" cy="32%" r="60%"><stop offset="0%" stop-color="${ring3}" stop-opacity="0.85"/><stop offset="100%" stop-color="${ring3}" stop-opacity="0"/></radialGradient>
    <radialGradient id="c" cx="50%" cy="94%" r="68%"><stop offset="0%" stop-color="${ring2}" stop-opacity="0.9"/><stop offset="100%" stop-color="${ring2}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#a)"/>
  <rect width="256" height="256" fill="url(#b)"/>
  <rect width="256" height="256" fill="url(#c)"/>
</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const STORAGE_KEY = "home-backdrop";
const BACKDROP_EVENT = "m4-home-backdrop";
const wavesIndex = BACKDROPS.findIndex((b) => b.id === "waves");

// localStorage-as-external-store: SSR-stable, hydration-safe, and lint-clean
// (no setState-in-effect). Same-tab writes notify through a custom event;
// cross-tab through the native `storage` event.
function subscribeBackdrop(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(BACKDROP_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(BACKDROP_EVENT, callback);
  };
}
function getStoredBackdrop(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function resolveIndex(storedId: string | null, fallback: number): number {
  if (storedId) {
    const i = BACKDROPS.findIndex((b) => b.id === storedId);
    if (i >= 0) return i;
  }
  return fallback;
}

export function HomeBackdropSwitcher() {
  const t = useTranslations("Home");
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const storedId = useSyncExternalStore(
    subscribeBackdrop,
    getStoredBackdrop,
    () => null,
  );

  // Interactive on every device: touch drives Galaxy (pointermove) and
  // Waves (touchmove), so coarse pointers get the switcher + controls too.
  // Default to the lightweight Waves on coarse / reduced motion to respect
  // the mobile GPU budget; Galaxy on a fine pointer; persisted choice wins.
  const coarse = !finePointer;
  const index = resolveIndex(storedId, coarse || reduce ? wavesIndex : 0);
  const active = BACKDROPS[index];

  const select = (raw: number) => {
    const n = (raw + BACKDROPS.length) % BACKDROPS.length;
    try {
      window.localStorage.setItem(STORAGE_KEY, BACKDROPS[n].id);
    } catch {
      // private mode — ignore.
    }
    window.dispatchEvent(new Event(BACKDROP_EVENT));
  };

  return (
    <>
      <div className="absolute inset-0 -z-20">
        <div
          aria-hidden="true"
          className={cn("absolute inset-0", active.wrapperClassName)}
        >
          {active.render()}
        </div>
        <BackdropScrim />
      </div>

      <div className="absolute right-4 top-24 z-20 flex items-center gap-1 rounded-full border border-border/60 bg-background/55 p-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground glass-blur lg:right-6">
          <button
            type="button"
            aria-label={t("backdropPrev")}
            onClick={() => select(index - 1)}
            className={cn(
              "grid size-8 place-items-center rounded-full transition duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/5 hover:text-foreground motion-safe:active:scale-95",
              FOCUS_RING,
            )}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            className="min-w-28 px-1 text-center text-foreground/85"
          >
            {String(index + 1).padStart(2, "0")}
            <span className="text-muted-foreground">
              {" / "}
              {String(BACKDROPS.length).padStart(2, "0")}
              {" · "}
            </span>
            {t(`backdrops.${active.key}`)}
          </span>
          <button
            type="button"
            aria-label={t("backdropNext")}
            onClick={() => select(index + 1)}
            className={cn(
              "grid size-8 place-items-center rounded-full transition duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/5 hover:text-foreground motion-safe:active:scale-95",
              FOCUS_RING,
            )}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
    </>
  );
}

/** Soft theme-driven wash so hero copy stays legible over any field. */
function BackdropScrim() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--background) 55%, transparent), transparent 58%), linear-gradient(to bottom, color-mix(in srgb, var(--background) 42%, transparent), transparent 24%, transparent 68%, color-mix(in srgb, var(--background) 52%, transparent))",
      }}
    />
  );
}
