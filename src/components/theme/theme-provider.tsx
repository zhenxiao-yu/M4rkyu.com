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
 * Suppress CSS transitions for one frame so a theme swap flips
 * instantly instead of fading every transitioning element over its
 * normal duration. Returns a cleanup that re-enables on the next
 * animation frame, after the new attribute has had a chance to apply.
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
  // Force a synchronous reflow so the no-transition rule lands before
  // the attribute swap. Reading offsetHeight is the canonical trick.
  void document.body.offsetHeight;
  return () => {
    // Re-enable on the next frame so the DOM-side swap takes effect
    // first; otherwise the new attribute and the rule removal land in
    // the same paint and transitions play after all.
    requestAnimationFrame(() => style.remove());
  };
}

/**
 * Owned theme provider. The before-paint `data-theme` attribute is set
 * by `src/app/layout.tsx`; this provider keeps a React mirror of the
 * same state and writes it back to localStorage + the `data-theme`
 * attribute as the user changes it.
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

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemPref : theme;

  // Reflect resolvedTheme into `<html data-theme>` so the CSS variants
  // (`@custom-variant dark` in globals.css) update.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      // Write the resolved theme to the DOM *synchronously* so the
      // attribute change lands inside the same task as the click
      // event. Two reasons this matters:
      //   1. Latency — the user sees colors flip on the same frame
      //      instead of waiting for React to commit + useEffect to
      //      run on the next tick.
      //   2. View transitions — ThemeSwitcher wraps setTheme in
      //      `document.startViewTransition(() => setTheme(next))`.
      //      The API captures the DOM before the callback runs, then
      //      again after. If the callback only schedules a state
      //      update, the DOM is identical at both capture points and
      //      the transition animates nothing.
      const resolved = next === "system" ? systemPref : next;
      const restore = suppressTransitions();
      document.documentElement.setAttribute("data-theme", resolved);
      restore();
      setThemeState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode / quota — ignore. In-memory state still updates.
      }
    },
    [systemPref],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, themes: THEMES }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * If called outside a provider (e.g. early SSR), returns a safe no-op
 * shape instead of throwing.
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
