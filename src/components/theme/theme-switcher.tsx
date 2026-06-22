"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import type { MouseEvent } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Single-icon dark ↔ light toggle. Both icons are rendered; the
 * Tailwind `dark:` variant hides whichever isn't current. This
 * avoids the JS-side `mounted` dance and any hydration mismatch —
 * the SSR markup matches the client, then the site theme provider
 * flips the `data-theme` attribute which the CSS selectors respond to.
 *
 * Clicking always lands the visitor on the *opposite* of the
 * currently-active resolved theme. When the View Transitions API
 * is supported and the visitor hasn't asked for reduced motion,
 * the swap animates as a circle reveal expanding from the click
 * coordinates (or the button center for keyboard activation). All
 * other paths fall through to a plain instant flip.
 */
export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    if (typeof document === "undefined") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    // Read the attribute at click time so tests, fast double-clicks,
    // and system-theme changes all flip from the DOM's real state
    // instead of a stale React render.
    const activeTheme =
      document.documentElement.getAttribute("data-theme") ?? resolvedTheme;
    const next = activeTheme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (typeof document.startViewTransition !== "function" || reduceMotion) {
      setTheme(next);
      return;
    }

    // Anchor the reveal at the cursor. `event.detail === 0` is the
    // canonical "click was synthesized by keyboard activation"
    // signal — fall back to the button center then so Enter/Space
    // doesn't reveal from the viewport origin.
    const rect = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    const cx = fromKeyboard ? rect.left + rect.width / 2 : event.clientX;
    const cy = fromKeyboard ? rect.top + rect.height / 2 : event.clientY;
    const root = document.documentElement;
    root.style.setProperty("--vt-cx", `${cx}px`);
    root.style.setProperty("--vt-cy", `${cy}px`);
    root.dataset.themeSweep = "on";

    const transition = document.startViewTransition(() => {
      setTheme(next);
    });
    // `transition.finished` rejects when the transition is skipped
    // (e.g. a second click aborts the first). Catch so the reject
    // doesn't surface as an unhandledrejection; finally always
    // clears the data attribute.
    void transition.finished
      .catch(() => undefined)
      .finally(() => {
        delete root.dataset.themeSweep;
      });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          data-testid="theme-toggle"
          onClick={toggle}
          className={cn(
            "inline-flex h-9 w-9 pointer-coarse:size-11 items-center justify-center rounded-md border border-border bg-background/70 p-0 text-muted-foreground transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:bg-background/70 hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
            FOCUS_RING,
          )}
        >
          <Sun className="size-4 hidden dark:block" aria-hidden="true" />
          <Moon className="size-4 block dark:hidden" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}
