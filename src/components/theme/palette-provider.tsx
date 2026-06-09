"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The named visual themes — a second axis on top of light/dark. Each maps
 * the colour tokens in `globals.css` under `:root[data-palette="…"]`; the
 * mode (light/dark) is still owned by ThemeProvider. Adding a palette =
 * one token block in `globals.css` + one entry here + one whitelist entry
 * in the theme bootstrap (`theme-script.tsx`).
 *
 * `swatch` = [paper, ink, accent] used by the picker preview chip.
 */
export type Palette = "risograph" | "terminal" | "editorial";

/** The signature texture a theme paints over its surfaces. */
export type PreviewTexture = "grain" | "scanlines" | "none";

/** Colour set for a preview poster tile, mirroring the globals.css token
 * block for the theme in one mode. */
export interface PreviewColors {
  paper: string;
  ink: string;
  accent: string;
  accent2: string;
  muted: string;
}

export interface PaletteMeta {
  value: Palette;
  /** next-intl key under the `Theme` namespace. */
  key: string;
  /** compact swatch [surface, ink, accent] — used by the small controls. */
  swatch: readonly [string, string, string];
  /** the theme's signature overlay, drawn on the Appearance poster tiles. */
  texture: PreviewTexture;
  /** poster colours per mode, kept in sync with the globals.css blocks. */
  preview: { light: PreviewColors; dark: PreviewColors };
}

export const PALETTES: readonly PaletteMeta[] = [
  {
    value: "risograph",
    key: "risograph",
    swatch: ["#efe7d8", "#16130d", "#e8412a"],
    texture: "grain",
    preview: {
      light: { paper: "#efe7d8", ink: "#16130d", accent: "#e8412a", accent2: "#2740e0", muted: "#d6ccb6" },
      dark: { paper: "#0c0b08", ink: "#efe7d6", accent: "#ff5a3c", accent2: "#5b78ff", muted: "#2a241a" },
    },
  },
  {
    value: "terminal",
    key: "terminal",
    swatch: ["#07080a", "#ded8c8", "#ffb000"],
    texture: "scanlines",
    preview: {
      light: { paper: "#ece6d8", ink: "#1a1610", accent: "#b06a00", accent2: "#1c7a32", muted: "#d2c8b0" },
      dark: { paper: "#07080a", ink: "#ded8c8", accent: "#ffb000", accent2: "#46f06a", muted: "#233040" },
    },
  },
  {
    value: "editorial",
    key: "editorial",
    swatch: ["#f6f4ee", "#0a0a0a", "#e2231a"],
    texture: "none",
    preview: {
      light: { paper: "#f6f4ee", ink: "#0a0a0a", accent: "#e2231a", accent2: "#0a0a0a", muted: "#d8d4c8" },
      dark: { paper: "#0b0b0b", ink: "#f4f1e8", accent: "#ff3b2f", accent2: "#f4f1e8", muted: "#2a2a2a" },
    },
  },
] as const;

export const DEFAULT_PALETTE: Palette = "risograph";

const STORAGE_KEY = "palette";
const VALUES = PALETTES.map((p) => p.value);

interface PaletteContextValue {
  palette: Palette;
  setPalette: (next: Palette) => void;
  palettes: readonly PaletteMeta[];
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

function readStored(): Palette {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (VALUES as string[]).includes(stored)) {
      return stored as Palette;
    }
  } catch {
    // localStorage can throw (private mode, etc.) — fall through.
  }
  return DEFAULT_PALETTE;
}

/**
 * Suppress CSS transitions for one frame so a palette swap flips
 * instantly instead of cross-fading every transitioning element. Mirrors
 * the helper in ThemeProvider; kept local so the providers stay
 * independent.
 */
function suppressTransitions(): () => void {
  if (typeof document === "undefined") return () => undefined;
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none !important;animation-duration:0s !important;animation-delay:0s !important}",
    ),
  );
  document.head.appendChild(style);
  void document.body.offsetHeight;
  return () => {
    requestAnimationFrame(() => style.remove());
  };
}

/**
 * Owned palette provider. The before-paint `data-palette` attribute is set
 * by the theme bootstrap (`theme-script.tsx`); this keeps a React mirror
 * and writes it back to localStorage + the `data-palette` attribute as the
 * user changes it.
 */
export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<Palette>(() => readStored());

  const setPalette = useCallback((next: Palette) => {
    const restore = suppressTransitions();
    document.documentElement.setAttribute("data-palette", next);
    restore();
    setPaletteState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / quota — ignore. In-memory state still updates.
    }
  }, []);

  const value = useMemo<PaletteContextValue>(
    () => ({ palette, setPalette, palettes: PALETTES }),
    [palette, setPalette],
  );

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

/**
 * If called outside a provider (early SSR), returns a safe default shape
 * instead of throwing.
 */
export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (ctx) return ctx;
  return {
    palette: DEFAULT_PALETTE,
    setPalette: () => {},
    palettes: PALETTES,
  };
}
