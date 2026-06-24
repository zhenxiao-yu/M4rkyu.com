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
export type Palette = "risograph" | "terminal" | "editorial" | "blueprint";

/** The signature texture a theme paints over its surfaces. */
export type PreviewTexture = "grain" | "scanlines" | "grid" | "none";

/** Colour set for a preview poster tile, mirroring the globals.css token
 * block for the theme in one mode. */
export interface PreviewColors {
  paper: string;
  ink: string;
  accent: string;
  accent2: string;
  accent3: string;
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
    swatch: ["#f1e8d3", "#15110a", "#ec4226"],
    texture: "grain",
    preview: {
      light: { paper: "#f1e8d3", ink: "#15110a", accent: "#ec4226", accent2: "#2740e0", accent3: "#c98a00", muted: "#c4b487" },
      dark: { paper: "#080705", ink: "#f6efe2", accent: "#ff5a3c", accent2: "#5b78ff", accent3: "#ffc24d", muted: "#342c1e" },
    },
  },
  {
    value: "terminal",
    key: "terminal",
    swatch: ["#060809", "#d6e0cf", "#ffb000"],
    texture: "scanlines",
    preview: {
      light: { paper: "#e3e8df", ink: "#121711", accent: "#9a6000", accent2: "#1d7a3a", accent3: "#0e7490", muted: "#bcc5b1" },
      dark: { paper: "#060809", ink: "#d6e0cf", accent: "#ffb000", accent2: "#46f06a", accent3: "#38d6ff", muted: "#233040" },
    },
  },
  {
    value: "editorial",
    key: "editorial",
    swatch: ["#f2f2f0", "#0a0a0a", "#e2231a"],
    texture: "none",
    preview: {
      light: { paper: "#f2f2f0", ink: "#0a0a0a", accent: "#e2231a", accent2: "#1a3fd0", accent3: "#a87b1e", muted: "#d4d4ce" },
      dark: { paper: "#0a0a0a", ink: "#f3f3f0", accent: "#ff3b2f", accent2: "#5b78ff", accent3: "#e0a23e", muted: "#2b2b2b" },
    },
  },
  {
    value: "blueprint",
    key: "blueprint",
    swatch: ["#eaf0f6", "#16263f", "#1f6fd6"],
    texture: "grid",
    preview: {
      light: { paper: "#eaf0f6", ink: "#16263f", accent: "#1f6fd6", accent2: "#0e8fb8", accent3: "#d6492f", muted: "#b9cadd" },
      dark: { paper: "#0a1320", ink: "#d6e3f2", accent: "#4aa8f0", accent2: "#38d0e8", accent3: "#ff6a4d", muted: "#243750" },
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
