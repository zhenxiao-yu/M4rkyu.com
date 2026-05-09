"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCommandPalette } from "./command-palette-provider";

/**
 * Visual entry point to the Cmd-K palette. Sits in the header rail.
 * Keyboard users can also open via Cmd/Ctrl-K from anywhere — the
 * provider owns the global keydown listener.
 */
export function CommandPaletteTrigger() {
  const { setOpen } = useCommandPalette();
  const t = useTranslations("CommandPalette");

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={t("title")}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-xs text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Search aria-hidden="true" className="size-3.5" />
      <span>{t("trigger")}</span>
      <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em]">
        ⌘K
      </kbd>
    </button>
  );
}
