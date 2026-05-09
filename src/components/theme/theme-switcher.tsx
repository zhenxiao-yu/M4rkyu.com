"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
 * currently-active resolved theme.
 */
export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle() {
    // Read at click time so we always flip from the current resolved
    // value, not from a stale render.
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
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
