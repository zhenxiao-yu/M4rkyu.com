"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  themes: readonly Theme[];
}

const STORAGE_KEY = "theme";
const THEMES = ["light", "dark", "system"] as const;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage can throw (private mode, etc.) — fall through.
  }
  return "system";
}

function systemPreference(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Hand-rolled theme provider — replaces next-themes, which emits a
 * "script tag in client component" warning under React 19. The
 * before-paint `data-theme` attribute is set by an inline `<script>`
 * in `src/app/layout.tsx` (server component, so no warning); this
 * provider keeps a React mirror of the same state and writes it back
 * to localStorage + the `data-theme` attribute as the user changes it.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize from storage on first client render so the React tree
  // reads the same theme the inline script already painted.
  const [theme, setThemeState] = useState<Theme>(() => readStored());
  // System preference is the only piece that actually needs state —
  // it changes externally (the user toggles their OS theme), so we
  // subscribe to the media query. `resolvedTheme` then derives
  // synchronously from `theme + systemPref`, no cascading effect.
  const [systemPref, setSystemPref] = useState<ResolvedTheme>(() =>
    systemPreference(),
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemPref(media.matches ? "dark" : "light");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemPref : theme;

  // Reflect resolvedTheme into `<html data-theme>` so the CSS variants
  // (`@custom-variant dark` in globals.css) update.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / quota — ignore. The in-memory state still updates.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, themes: THEMES }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Same shape as `next-themes`'s `useTheme` so consumers stay
 * mechanically identical. If called outside a provider (e.g. early
 * SSR), returns a safe no-op shape instead of throwing.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => {},
    themes: THEMES,
  };
}
