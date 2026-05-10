"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Single-icon dark ↔ light toggle. Both icons are rendered; the
 * Tailwind `dark:` variant hides whichever isn't current. This
 * avoids the JS-side `mounted` dance and any hydration mismatch —
 * the SSR markup matches the client, then `next-themes` flips the
 * `data-theme` attribute which the CSS selectors respond to.
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
    // Read at click time so we always flip from the current resolved
    // value, not from a stale render.
    const next = resolvedTheme === "dark" ? "light" : "dark";

    if (typeof document === "undefined") {
      setTheme(next);
      return;
    }

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
        <Button
          type="button"
          variant="outline"
          aria-label="Toggle theme"
          data-testid="theme-toggle"
          onClick={toggle}
          className="h-9 w-9 border-border bg-background/70 p-0 text-muted-foreground hover:border-ring/50 hover:bg-background/70 hover:text-foreground"
        >
          <Sun className="size-4 hidden dark:block" aria-hidden="true" />
          <Moon className="size-4 block dark:hidden" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}
